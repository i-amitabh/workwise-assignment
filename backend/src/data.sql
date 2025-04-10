CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	name VARCHAR(150) NOT NULL,
	email VARCHAR(50) UNIQUE NOT NULL,
	password VARCHAR(50) NOT NULL
);

CREATE TABLE seats (
    seat_id SERIAL PRIMARY KEY,
    status BOOLEAN NOT NULL,
    user_id INTEGER REFERENCES users(id)
);

INSERT INTO seats (status)
SELECT false
FROM generate_series(1, 80);