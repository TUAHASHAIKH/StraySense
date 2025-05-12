DELIMITER //

DROP PROCEDURE IF EXISTS SubmitAdoption //

CREATE PROCEDURE SubmitAdoption(
    IN p_user_id INT,
    IN p_animal_id INT,
    IN p_adoption_reason TEXT,
    IN p_housing_type VARCHAR(50),
    IN p_has_other_pets BOOLEAN,
    IN p_other_pets_details TEXT,
    IN p_has_children BOOLEAN,
    IN p_children_details TEXT,
    IN p_work_schedule VARCHAR(100),
    IN p_experience_level VARCHAR(50)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error submitting adoption request';
    END;

    START TRANSACTION;
    
    INSERT INTO adoptions (
        user_id,
        animal_id,
        adoption_reason,
        housing_type,
        has_other_pets,
        other_pets_details,
        has_children,
        children_details,
        work_schedule,
        experience_level,
        status
    ) VALUES (
        p_user_id,
        p_animal_id,
        p_adoption_reason,
        p_housing_type,
        p_has_other_pets,
        p_other_pets_details,
        p_has_children,
        p_children_details,
        p_work_schedule,
        p_experience_level,
        'pending'
    );
    
    COMMIT;
    
    SELECT LAST_INSERT_ID() as adoption_id;
END //

DELIMITER ; 