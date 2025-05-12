DELIMITER //

DROP PROCEDURE IF EXISTS SubmitStrayReport //

CREATE PROCEDURE SubmitStrayReport(
    IN p_user_id INT,
    IN p_description TEXT,
    IN p_animal_type ENUM('Dog','Cat','Cow','Donkey','Other'),
    IN p_animal_size ENUM('Small','Medium','Large'),
    IN p_visible_injuries TEXT,
    IN p_province VARCHAR(100),
    IN p_city VARCHAR(100),
    IN p_latitude DECIMAL(10, 8),
    IN p_longitude DECIMAL(11, 8)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error submitting stray report';
    END;

    START TRANSACTION;
    
    INSERT INTO Stray_Reports (
        user_id,
        description,
        animal_type,
        animal_size,
        visible_injuries,
        province,
        city,
        latitude,
        longitude,
        status
    ) VALUES (
        p_user_id,
        p_description,
        p_animal_type,
        p_animal_size,
        p_visible_injuries,
        p_province,
        p_city,
        p_latitude,
        p_longitude,
        'pending'
    );
    
    COMMIT;
    
    SELECT LAST_INSERT_ID() as report_id;
END //

DELIMITER ; 