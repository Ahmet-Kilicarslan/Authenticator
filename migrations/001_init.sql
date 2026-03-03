CREATE TABLE users
(
    id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username    VARCHAR(100) UNIQUE NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255)        NOT NULL,
    is_verified BOOLEAN   DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
create table auth_providers
(
    user_id          int,
    provider_name    varchar(100) not null,
    provider_user_id varchar(100) not null,
    primary key (user_id, provider_name),
    foreign key (user_id) references users (id) on delete cascade


);
CREATE TABLE roles
(
    id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) UNIQUE
);

CREATE TABLE permissions
(
    id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) UNIQUE
);

CREATE TABLE role_permissions
(
    role_id       INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles (id),
    FOREIGN KEY (permission_id) REFERENCES permissions (id)
);

create table user_roles
(
    user_id int not null,
    role_id int not null,
    primary key (user_id, role_id),
    foreign key (user_id) references users (id) on delete cascade,
    foreign key (role_id) references roles (id)

);

create table user_permissions
(
    user_id       int not null,
    permission_id int not null,
    primary key (user_id, permission_id),
    foreign key (user_id) references users (id),
    foreign key (permission_id) references permissions (id)
);



create table profile_pictures
(
    user_id     int,
    url         varchar(255),
    uploaded_at timestamp default current_timestamp,
    foreign key (user_id) references users(id) on delete cascade
);
