const db = require('../config/database');

class MovieService {

    static async searchMovies(filters = {}) {
        const { title, year, page = 1 } = filters;
        const limit = 100; // Results per page
        const offset = (page - 1) * limit;

        // Build the base query for filtering
        let baseQuery = db('basics')
            .where('titleType', 'movie') // Only movies, not TV shows
            .whereNotNull('year')
            .whereNotNull('primaryTitle');

        if (title) {
            baseQuery = baseQuery.where('primaryTitle', 'like', `%${title}%`);
        }

        if (year) {
            baseQuery = baseQuery.where('year', year);
        }

        const countQuery = baseQuery.clone().count('* as total').first();

        const dataQuery = baseQuery.clone()
            .select(
                'tconst as imdbID',
                'primaryTitle as title',
                'year',
                'runtimeMinutes',
                'genres'
            )
            .orderBy('year', 'desc')
            .orderBy('primaryTitle', 'asc')
            .limit(limit)
            .offset(offset);

        const [results, countResult] = await Promise.all([
            dataQuery,
            countQuery
        ]);

        const total = countResult.total;
        const totalPages = Math.ceil(total / limit);

        // Format results
        const formattedResults = results.map(movie => ({
            imdbID: movie.imdbID,
            title: movie.title,
            year: movie.year,
            runtime: movie.runtimeMinutes,
            genres: movie.genres && movie.genres !== '\\N' && movie.genres !== '' ?
                movie.genres.split(',') : null
        }));

        return {
            data: formattedResults,
            pagination: {
                total: parseInt(total),
                lastPage: totalPages,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < totalPages ? page + 1 : null,
                perPage: limit,
                currentPage: parseInt(page),
                from: offset + 1,
                to: Math.min(offset + limit, total)
            }
        };
    }

    static async getMovieDetails(imdbID) {
        // Get basic movie information
        const movie = await db('basics')
            .select(
                'tconst as imdbID',
                'primaryTitle as title',
                'year',
                'runtimeMinutes',
                'genres',
                'country',
                'poster',
                'plot',
                'rated',
                'boxoffice',
                'imdbRating',
                'rottentomatoesRating',
                'metacriticRating'
            )
            .where('tconst', imdbID)
            .where('titleType', 'movie')
            .first();

        if (!movie) {
            return null;
        }

        // Get principals (cast and crew) - join with names table
        const principals = await db('principals as p')
            .leftJoin('names as n', 'p.nconst', 'n.nconst')
            .select(
                'p.nconst as id',
                'n.primaryName as name',
                'p.name as fallbackName', // In case join fails
                'p.category',
                'p.job',
                'p.characters'
            )
            .where('p.tconst', imdbID)
            .orderBy('p.ordering')
            .limit(10); // Limit to top 10 principals

        // Format the response
        const result = {
            imdbID: movie.imdbID,
            title: movie.title,
            year: movie.year,
            runtime: movie.runtimeMinutes,
            genres: movie.genres && movie.genres !== '\\N' && movie.genres !== '' ?
                movie.genres.split(',') : null,
            country: movie.country,
            boxoffice: movie.boxoffice,
            poster: movie.poster,
            plot: movie.plot,
            rated: movie.rated,
            imdbRating: movie.imdbRating ? parseFloat(movie.imdbRating) : null,
            rottentomatoesRating: movie.rottentomatoesRating ? parseInt(movie.rottentomatoesRating) : null,
            metacriticRating: movie.metacriticRating ? parseInt(movie.metacriticRating) : null,
            classification: movie.rated, // Same as rated
            principals: principals.map(p => ({
                id: p.id,
                name: p.name || p.fallbackName, // Use fallback if join failed
                category: p.category,
                job: p.job && p.job !== '\\N' && p.job !== '' ? p.job : null,
                characters: p.characters && p.characters !== '\\N' && p.characters !== '' ?
                    p.characters : null
            }))
        };

        return result;
    }

    static async getPersonDetails(personID) {
        // Get basic person information
        const person = await db('names')
            .select(
                'nconst as id',
                'primaryName as name',
                'birthYear',
                'deathYear'
            )
            .where('nconst', personID)
            .first();

        if (!person) {
            return null;
        }

        const filmography = await db('principals as p')
            .join('basics as b', 'p.tconst', 'b.tconst')
            .select(
                'b.tconst as imdbID',
                'b.primaryTitle as title',
                'b.year',
                'p.category',
                'p.job',
                'p.characters'
            )
            .where('p.nconst', personID)
            .where('b.titleType', 'movie')
            .whereNotNull('b.year')
            .orderBy('b.year', 'desc')
            .limit(50); // Limit to recent 50 movies

        const result = {
            id: person.id,
            name: person.name,
            birthYear: person.birthYear,
            deathYear: person.deathYear,
            roles: filmography.map(role => ({
                imdbID: role.imdbID,
                title: role.title,
                year: role.year,
                category: role.category,
                job: role.job && role.job !== '\\N' && role.job !== '' ? role.job : null,
                characters: role.characters && role.characters !== '\\N' && role.characters !== '' ?
                    role.characters : null
            }))
        };

        return result;
    }

    static async getSampleMovies(limit = 10) {
        return await db('basics')
            .select(
                'tconst as imdbID',
                'primaryTitle as title',
                'year'
            )
            .where('titleType', 'movie')
            .whereNotNull('year')
            .whereNotNull('primaryTitle')
            .orderBy('year', 'desc')
            .limit(limit);
    }
}

module.exports = MovieService;