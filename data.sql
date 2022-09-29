\c biztime
DROP TABLE IF EXISTS invoices;

DROP TABLE IF EXISTS companies_industrys;

DROP TABLE IF EXISTS companies;

DROP TABLE IF EXISTS industry;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE industry (
    id serial PRIMARY KEY,
    name text UNIQUE
);

CREATE TABLE companies_industrys (
    industry_id integer NOT NULL REFERENCES industry,
    companies_code text NOT NULL REFERENCES companies,
    PRIMARY KEY (industry_id, companies_code)
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT FALSE NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

INSERT INTO companies
    VALUES ('apple', 'Apple Computer', 'Maker of OSX.'), ('ibm', 'IBM', 'Big blue.');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
    VALUES ('apple', 100, FALSE, NULL), ('apple', 200, FALSE, NULL), ('apple', 300, TRUE, '2018-01-01'), ('ibm', 400, FALSE, NULL);

INSERT INTO industry
    VALUES (1, 'Entertaiment'), (2, 'Sales');

INSERT INTO companies_industrys
    VALUES (1, 'apple'), (2, 'ibm'), (2, 'apple');

