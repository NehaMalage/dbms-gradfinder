CREATE DATABASE IF NOT EXISTS BACKEND_FINAL;
USE BACKEND_FINAL;

CREATE TABLE users (
  id int NOT NULL AUTO_INCREMENT,
  user_type enum('user','admin') DEFAULT 'user',
  username varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  password varchar(255) NOT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
);

CREATE TABLE IF NOT EXISTS College_Staging (
    college_id INT PRIMARY KEY,
    college_name VARCHAR(255),
    country VARCHAR(255),
    program_offered VARCHAR(255),
    last_date_of_application DATE,
    on_campus_accommodation TEXT,
    max_roommates INT,
    previous_qualifications_required VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS Application_Tracking (
    application_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    college_id INT,
    status VARCHAR(50),
    date_applied DATE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (college_id) REFERENCES College_staging(college_id)
);



CREATE TABLE IF NOT EXISTS College_Updates_Log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    college_name VARCHAR(255),
    updated_field VARCHAR(255),
    old_value TEXT,
    new_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/college_masters_programs.csv'
INTO TABLE College_Staging
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

DROP TRIGGER IF EXISTS after_college_update;

DELIMITER $$

CREATE TRIGGER after_college_update
AFTER UPDATE ON College_Staging
FOR EACH ROW
BEGIN
    -- Log changes in program_offered
    IF OLD.program_offered != NEW.program_offered THEN
        INSERT INTO College_Updates_Log (college_name, updated_field, old_value, new_value)
        VALUES (OLD.college_name, 'program_offered', OLD.program_offered, NEW.program_offered);
    END IF;
END$$

DELIMITER ;

SELECT * FROM COLLEGE_STAGING;
SELECT * FROM College_Updates_Log;
SET SQL_SAFE_UPDATES = 0;

UPDATE College_Staging
SET program_offered = 'New '
WHERE college_name = 'Kramer University';

SELECT * FROM College_Updates_Log;



