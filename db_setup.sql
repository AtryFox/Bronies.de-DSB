CREATE TABLE IF NOT EXISTS `daily` (
  `DATE` date NOT NULL,
  `MESSAGES` int(11) NOT NULL,
  `COMMANDS` int(11) NOT NULL,
  PRIMARY KEY (`DATE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE IF NOT EXISTS `member` (
  `ID` varchar(18) NOT NULL,
  `USERNAME` text NOT NULL,
  `NICKNAME` text,
  `DISCRIMINATOR` int(11) NOT NULL,
  `AVATAR` text NOT NULL,
  `EXP` int(11) NOT NULL,
  `LASTLVL` int(11) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE IF NOT EXISTS `spoiler` (
  `MESSAGE_ID` varchar(18) NOT NULL,
  `MESSAGE_DATE` datetime NOT NULL,
  `MESSAGE` text NOT NULL,
  `MEMBER_ID` varchar(18) NOT NULL,
  PRIMARY KEY (`MESSAGE_ID`),
  KEY `spoiler_author` (`MEMBER_ID`),
  CONSTRAINT `spoiler_author` FOREIGN KEY (`MEMBER_ID`) REFERENCES `member` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8