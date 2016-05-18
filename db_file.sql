CREATE TABLE `pm-extension`.`user_info` (
  `username` VARCHAR(255) NOT NULL,
  `password_hint` VARCHAR(255) NOT NULL,
  `cipher_checksum` TEXT(2000) NOT NULL,
  PRIMARY KEY (`username`),
  UNIQUE INDEX `username_UNIQUE` (`username` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;