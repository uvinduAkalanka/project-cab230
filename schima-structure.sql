create table basics
(
    tconst               varchar(255)  not null,
    titleType            varchar(255)  not null,
    primaryTitle         varchar(255)  not null,
    originalTitle        varchar(255)  not null,
    year                 int           null,
    runtimeMinutes       int           null,
    genres               varchar(255)  not null,
    country              varchar(255)  null,
    poster               varchar(255)  null,
    plot                 text          null,
    rated                varchar(255)  null,
    boxoffice            int           null,
    imdbRating           decimal(3, 1) null,
    rottentomatoesRating decimal(3)    null,
    metacriticRating     decimal(3)    null,
    id                   int auto_increment
        primary key,
    constraint idx_tconst
        unique (tconst)
)
    collate = utf8mb4_unicode_ci;

create table crew
(
    tconst    varchar(255) not null,
    directors varchar(255) not null,
    writers   varchar(255) not null,
    id        int auto_increment
        primary key
)
    collate = utf8mb4_unicode_ci;

create index idx_tconst
    on crew (tconst);

create table movies
(
    C1 text null,
    C2 text null
);

create table names
(
    nconst            varchar(255) not null,
    primaryName       varchar(255) not null,
    birthYear         int          null,
    deathYear         int          null,
    primaryProfession varchar(255) not null,
    knownForTitles    varchar(255) null,
    id                int auto_increment
        primary key
)
    collate = utf8mb4_unicode_ci;

create index idx_nconst
    on names (nconst);

create table principals
(
    tconst     varchar(255) not null,
    ordering   int          not null,
    nconst     varchar(255) not null,
    category   varchar(255) not null,
    job        varchar(255) not null,
    characters varchar(255) not null,
    id         int auto_increment
        primary key,
    name       varchar(255) null,
    movieName  varchar(255) null
)
    collate = utf8mb4_unicode_ci;

create index idx_tconst
    on principals (tconst);

create table ratings
(
    tconst varchar(255) not null,
    source varchar(255) not null,
    value  varchar(255) not null,
    id     int auto_increment
        primary key
)
    collate = utf8mb4_unicode_ci;

create index idx_tconst
    on ratings (tconst);

create table ratingsold
(
    tconst        varchar(255) not null,
    averageRating varchar(255) not null,
    numVotes      varchar(255) not null,
    id            int auto_increment
        primary key
)
    collate = utf8mb4_unicode_ci;

create index idx_tconst
    on ratingsold (tconst);

