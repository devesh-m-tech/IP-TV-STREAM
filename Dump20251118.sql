-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: iptv
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (4,'Mani@2024.com','$2b$10$rBVa2DAPchR649Fijh6aeu5.dc1zcz5HJJ6PlYBFpA2YjWJYtD9.O','2025-10-06 17:41:16');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `channels`
--

DROP TABLE IF EXISTS `channels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `channels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `language` varchar(50) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `videoUrl` text NOT NULL,
  `drm` varchar(50) DEFAULT 'CLEARKEY',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `channels`
--

LOCK TABLES `channels` WRITE;
/*!40000 ALTER TABLE `channels` DISABLE KEYS */;
INSERT INTO `channels` VALUES (2,'Sun Tv HD ','/uploads/1761119538908-1zh4zd.png','Tamil','Entertainment','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_896.m3u8',NULL),(8,'Raj Digital Plus','/uploads/1763204068297-9jju6q.png','Tamil','Movies','https://livestream.rajtv.tv/cluster1/Content/Channel/Rajdigitalplus/HLS/stream_05/index.m3u8',NULL),(9,'Raj Tv','/uploads/1763204191905-oalsk2.png','Tamil','Entertainment','https://livestream.rajtv.tv/cluster1/Content/Channel/RajTV/HLS/stream_05/index.m3u8',NULL),(10,'Murasu Tv','/uploads/1763204314137-6y6voo.png','Tamil','Music','https://yuppmedtaorire.akamaized.net/v1/manifest/a0d007312bfd99c47f76b77ae26b1ccdaae76cb1/murasu_nim_https/3e680037-0586-4f50-8483-bd26d495abc4/0.m3u8',NULL),(12,'Raj musix','/uploads/1763288849236-yrck0u.png','Tamil','Music','https://livestream.rajtv.tv/cluster1/Content/Channel/Rajmusix/HLS/stream_05/index.m3u8',NULL),(13,'Vijay tv HD','/uploads/1763289594512-sol2vd.png','Tamil','Entertainment','https://allinonereborn.online/iptv-web/player.html?url=https%3A%2F%2Fallinonereborn.online%2Fiptv-web%2Flive.php%3Fid%3D281567',NULL),(16,'Colors Tamil  HD','/uploads/1763355593305-oegjtz.png','Tamil','Entertainment','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_429.m3u8',NULL),(17,'J Move ','/uploads/1763355665070-x1e59y.png','Tamil','Movies','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_417.m3u8',NULL),(18,'Jaya Tv HD','/uploads/1763355759071-mpwfxh.png','Tamil','Entertainment','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_419.m3u8',NULL),(19,'Jaya Max','/uploads/1763355822501-71ljzj.png','Tamil','Music','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_420.m3u8',NULL),(20,'Sun Life','/uploads/1763355927276-yti5yl.png','Tamil','Music','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_682.m3u8',NULL),(21,'Polimer Tv','/uploads/1763356008351-r91ntq.png','Tamil','Entertainment','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_705.m3u8',NULL),(22,'Makkal Tv','/uploads/1763356130406-qprxd3.png','Tamil','Entertainment','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_708.m3u8',NULL),(23,'Adithya Tv','/uploads/1763356184560-gjwp2a.png','Tamil','Entertainment','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_709.m3u8',NULL),(24,'Vasanth Tv','/uploads/1763356240534-8ube32.png','Tamil','Entertainment','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_727.m3u8',NULL),(25,'Peppers Tv','/uploads/1763356385480-j4h0ip.png','Tamil','Entertainment','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_796.m3u8',NULL),(26,'Tunes 6','/uploads/1763356447780-vav8ge.png','Tamil','Music','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_803.m3u8',NULL),(27,'Travelxp Tamil','/uploads/1763356510920-popguw.png','Tamil','Entertainment','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_814.m3u8',NULL),(28,'Puthuyugam Tv','/uploads/1763356564741-kl2cty.png','Tamil','Entertainment','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_824.m3u8',NULL),(29,'Malaimurasu','/uploads/1763356661271-uzdy6r.png','Tamil','News','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_826.m3u8',NULL),(30,'Thanthi Tv','/uploads/1763356935595-zqorbp.png','Tamil','News','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_830.m3u8',NULL),(31,'Madhimugam Tv','/uploads/1763357129503-ywlgkm.png','Tamil','Entertainment','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_843.m3u8',NULL),(32,'Vendhar Tv ','/uploads/1763357330406-nzs5qz.png','Tamil','Entertainment','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_857.m3u8',NULL),(33,'K Tv HD','/uploads/1763357420682-si5fh0.png','Tamil','Movies','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_894.m3u8',NULL),(34,'Sun Music ','/uploads/1763357510893-bxzhyp.png','Tamil','Music','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_895.m3u8',NULL),(35,'Win TV','/uploads/1763357766821-asng2f.png','Tamil','Entertainment','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_970.m3u8',NULL),(36,'Vanavil Tv','/uploads/1763358030105-57vuom.png','Tamil','Entertainment','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_971.m3u8',NULL),(37,'Kalaignar Tv','/uploads/1763358103460-kqrf5p.png','Tamil','Entertainment','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_1209.m3u8',NULL),(38,'Kalaignar Seithigal','/uploads/1763358196723-f3na1c.png','Tamil','News','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_1210.m3u8',NULL),(39,'News J','/uploads/1763358666811-meccqh.png','Tamil','News','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_1515.m3u8',NULL),(40,'Mk Six','/uploads/1763358952427-wsrpsc.png','Tamil','Entertainment','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_1647.m3u8',NULL),(41,'News Tamil 24X7','/uploads/1763359139688-vkhyrq.png','Tamil','News','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_1954.m3u8',NULL),(42,'M Nadu','/uploads/1763359263771-4d6sdu.png','Tamil','News','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_2434.m3u8',NULL),(43,'Janam Tamil','/uploads/1763359370661-zxhq4v.png','Tamil','News','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_3045.m3u8',NULL),(44,'Thanthi One','/uploads/1763361007153-wqivw0.png','Tamil','Entertainment','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_3059.m3u8',NULL),(45,'Cartoon Network HD','/uploads/1763361197195-67xcd5.png','Tamil','Kids','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_1081.m3u8',NULL),(46,'Poco Tv','/uploads/1763361299507-2o37f8.png','Tamil','Kids','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_542.m3u8',NULL),(47,'Sonic Tamil','/uploads/1763361361975-tw7xbo.png','Tamil','Kids','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_290.m3u8',NULL),(48,'Nick Tamil','/uploads/1763361427798-ewl9vy.png','Tamil','Kids','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_546.m3u8',NULL),(49,'Discovery Kids Tamil','/uploads/1763361524048-r5v0ny.png','Tamil','Kids','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_550.m3u8',NULL),(50,'Chutti Tv ','/uploads/1763361580826-8y8vye.png','Tamil','Kids','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_557.m3u8',NULL),(51,'Sony Yay Tamil','/uploads/1763361684040-vor7i0.png','Tamil','Kids','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_873.m3u8',NULL),(52,'Raj News 24X7','/uploads/1763362126466-rt6evd.png','Tamil','News','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_767.m3u8',NULL),(53,'News 18 Tamilnadu','/uploads/1763362225632-na8rs9.png','Tamil','News','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_615.m3u8',NULL),(54,'Polimer News','/uploads/1763362330703-7t5dtz.png','Tamil','News','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_636.m3u8',NULL),(55,'Sathiyam Tv','/uploads/1763362529703-5bivp7.png','Tamil','News','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_671.m3u8',NULL),(56,'News7 Tamil','/uploads/1763362590447-fcbffr.png','Tamil','News','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_673.m3u8',NULL),(57,'Sun News','/uploads/1763362688480-9jkk0k.png','Tamil','News','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_676.m3u8',NULL),(58,'Puthiya Thalaimurai','/uploads/1763362752041-zfewvi.png','Tamil','News','https://mini.allinonereborn.fun/jiotv-in/app/ts_live_677.m3u8',NULL),(59,'Zee Tamil HD','/uploads/1763363522963-pezq2v.webp','Tamil','Entertainment','https://allinonereborn.online/iptv-web/player.html?url=https%3A%2F%2Fallinonereborn.online%2Fiptv-web%2Flive.php%3Fid%3D281564',NULL),(60,'Vijay Super','/uploads/1763363976065-i5nn12.jpg','Tamil','Movies','https://allinonereborn.online/iptv-web/player.html?url=https%3A%2F%2Fallinonereborn.online%2Fiptv-web%2Flive.php%3Fid%3D281621',NULL),(61,'Zee Thirai','/uploads/1763364195879-nnpwaz.jpg','Tamil','Movies','https://allinonereborn.online/iptv-web/player.html?url=https%3A%2F%2Fallinonereborn.online%2Fiptv-web%2Flive.php%3Fid%3D281623',NULL);
/*!40000 ALTER TABLE `channels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `device_id` varchar(255) NOT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_devices_user` (`user_id`),
  CONSTRAINT `devices_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_devices_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
INSERT INTO `devices` VALUES (9,8,'tv-002',1,'2025-11-15 10:38:58');
/*!40000 ALTER TABLE `devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `maxDevices` int(11) NOT NULL DEFAULT 1,
  `role` varchar(20) NOT NULL DEFAULT 'user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'user2@test.com','$2b$10$UPq.c/rNSD25SXZgF6L0feHwKaIPeQzC6yPqfW9mRTWaJI2ryUQ.a',1,'2025-09-28 08:42:53',3,'user'),(8,'poptv@com','$2b$10$c5YwPqXB46D2N87N/.TUfe8QiSIElALDivwyxc/3QX4ZbvzLuXWzi',1,'2025-11-15 10:38:30',5,'user');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-18 16:44:44
