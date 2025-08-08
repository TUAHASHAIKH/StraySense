DELIMITER //

DROP PROCEDURE IF EXISTS GetVaccinationSchedule //

CREATE PROCEDURE GetVaccinationSchedule(
    IN p_animal_id INT
)
BEGIN
    SELECT 
        v.vaccination_id,
        v.animal_id,
        v.vaccine_id,
        v.scheduled_date,
        v.completed_date,
        v.created_at,
        vt.name as vaccine_type
    FROM Vaccinations v 
    JOIN Vaccine_Types vt ON v.vaccine_id = vt.vaccine_id 
    WHERE v.animal_id = p_animal_id 
    ORDER BY v.scheduled_date ASC;
END //

DELIMITER ; 