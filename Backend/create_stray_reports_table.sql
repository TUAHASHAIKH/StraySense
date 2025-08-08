CREATE TABLE IF NOT EXISTS stray_reports (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    description TEXT NOT NULL,
    animal_type VARCHAR(50) NOT NULL,
    animal_size VARCHAR(50) NOT NULL,
    visible_injuries TEXT,
    province VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
); 