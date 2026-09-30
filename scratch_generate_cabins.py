import json
import os

raw_entries = [
    # Page 1
    (1, "G-01", "Dr. BASEERA A", "9698960667", "Occupied", ""),
    (2, "G-02", "Dr. Vinod Bhatt", "9826143220", "Occupied", ""),
    (3, "G-03", "Dr. G. Vishnuvarthanan", "9360654171", "Occupied", ""),
    (4, "G-04", "Dr. Manisha Jain", "9039826104", "Occupied", ""),
    (5, "G-05", "Dr. Ribu Methew", "9003397713", "Occupied", "Dr. A Sirajuddin"),
    (6, "G-06", "Dr. Manoj Acharya", "9827206056", "Occupied", ""),
    (7, "G-07", "Dr. Paras Jain", "", "Occupied", ""),
    (8, "G-08", "Dr. Lakshmi D.", "8610093319", "Occupied", ""),
    (9, "G-09", "Dr. PUSHPINDER SINGH PATHEJA", "9893273243", "Occupied", ""),
    (10, "G-10", "Dr. Dev brat Gupta", "9079344563", "Occupied", ""),
    (11, "G-11", "Dr. Anant Kant Shukla", "8050710905", "Occupied", ""),
    (12, "G-12", "Dr. Javed Khan Sheikh", "9320017780", "Occupied", ""),
    (13, "G-13", "Dr. Nikhil Pateria", "7999324362", "Occupied", ""),
    (14, "G-14", "Dr. G.R. Hemalakshmi", "9500396629", "Occupied", ""),
    (15, "G-15", "Dr. Venkat padhy", "8310597038", "Occupied", ""),
    (16, "G-16", "Nagarajan I", "9131128386", "Occupied", ""),
    (17, "G-17", "VIJAY KUMAR TRIVEDI", "8098999684", "Occupied", ""),
    (18, "G-18", "Dr. Abha Sharma", "8838270601", "Occupied", ""),
    (19, "G-19", "Dr. Dileep Kumar", "9926639291", "Occupied", ""),
    (20, "G-20", "D. Harish Babu", "9455222528", "Occupied", ""),
    (21, "G-21", "J.P. Shritharanyaa", "9893948272", "Occupied", ""),
    (22, "G-22", "Dr. Buvaneswari", "9885168010", "Occupied", ""),
    (23, "A-101", "Dr. Praveen Lalwani", "9826573350", "Occupied", ""),
    (24, "A-102", "Dr. Sheetal Sharma", "8103555591", "Occupied", ""),
    (25, "A-103", "I. Jasmine Selvakumari Jeya", "9443381609", "Occupied", ""),
    (26, "A-104", "Ar. Poonam Upadhyay", "8860125107", "Occupied", ""),
    (27, "A-105", "Board Room", "", "Occupied", "Board Room"),
    (28, "A-106", "Dr. Kumar Abhishek", "9043642001", "Occupied", ""),
    (29, "A-107", "Dr. Suparna Patowary", "7433819775", "Occupied", ""),
    (30, "A-108", "Dr. Arun Kumar K.", "", "Occupied", ""),
    (31, "A-109", "Dr. Hemant Kumar Nashine", "8770771319", "Occupied", ""),
    (32, "A-110", "Dr. Reena Jain", "8989982847", "Occupied", ""),
    (33, "A-111", "Dr. Ranju Yadav", "9406834330", "Occupied", ""),
    (34, "A-112", "Dr. Chandrabhan Seniya", "9755213002", "Occupied", ""),
    (35, "A-113", "Dr. Faisal Rasheed Lone", "7006910686", "Occupied", ""),
    (36, "A-114", "Dr. Sajjad Ahmed", "7006483148", "Occupied", ""),
    (37, "A-115", "Sripriyan", "8754089331", "Occupied", ""),
    (38, "A-116", "Mr. Abhishek Kumar Shukla", "7470529298", "Occupied", ""),
    (39, "A-117", "Azra Nazir", "7006543347", "Occupied", ""),
    (40, "A-118", "Ms Manorama Chouhan", "7415659511", "Occupied", ""),
    (41, "A-119", "Arindam Sadhukhan", "8804552592", "Occupied", ""),
    (42, "A-120", "Ajay Sharma", "9203837010", "Occupied", ""),
    (43, "A-121", "Bhupendra Panchal", "9770240818", "Occupied", ""),
    (44, "A-122", "Pranshu Pranjal", "8979609032", "Occupied", ""),
    (45, "A-201", "Mamta Agarwal", "9425027637", "Occupied", ""),
    (46, "A-202", "Dr. Pon Harshavardhanan", "9840768153", "Occupied", ""),
    (47, "A-203", "Navneet Kumar Verma", "9598663322", "Occupied", ""),
    (48, "A-204", "Shweta Mukherjee", "7354155194 / 9826215494", "Occupied", ""),
    (49, "A-205", "Dr. Subash Chandra Bose", "9445842201", "Occupied", ""),
    (50, "A-206", "Dr. Sasmita Padhy", "9040946658", "Occupied", ""),
    (51, "A-207", "Dr. Sandip Mal", "7974537024", "Occupied", ""),
    (52, "A-208", "Dr. Preetam Suman", "7376333523", "Occupied", ""),
    (53, "A-209", "Karishma Tiwari", "7227881018", "Occupied", ""),
    (54, "A-210", "Balaguru S", "9444465649", "Occupied", ""),
    (55, "A-211", "Dr Vinesh Kumar", "9758648636", "Occupied", ""),
    (56, "A-212", "Dr. A Usha Ruby", "7708465168", "Occupied", ""),
    (57, "A-213", "Dr. Ranjeeta Kumar", "", "Occupied", ""),
    (58, "A-214", "Dr. M. Manimaran", "", "Occupied", ""),
    (59, "A-215", "Dr. S. Devaraju", "9788445867", "Occupied", ""),
    (60, "A-216", "Harish Chandra", "7248659909", "Occupied", ""),
    (61, "A-217", "Dr. Dheresh Soni", "8878743351", "Occupied", ""),
    (62, "A-218", "Dr. Gopal S Tandel", "9893773358", "Occupied", ""),
    (63, "A-219", "Jaynthi J.", "9646491907", "Alloted", "Duplicate Key Handover"),
    (64, "A-220", "Ujjwal Kumar Mishra", "9852977391", "Occupied", ""),
    (65, "A-221", "MR. JAY PRAKASH MAURYA", "7354549227", "Occupied", ""),
    (66, "A-222", "Chandrama Swain", "8460934933", "Occupied", ""),
    (67, "A-223", "Dr. Abdul Rehman", "", "Occupied", ""),
    (68, "A-224", "Dr. S. AANJANKUMAR", "9786501012", "Occupied", ""),
    (69, "A-225", "Karthik Rao M C", "9742739015", "Occupied", ""),
    (70, "A-226", "Dr. Vijay Kumar Patidar", "", "Occupied", ""),
    (71, "A-227", "Dr. Rajdeep Ghosh", "9085577988", "Occupied", ""),
    (72, "A-228", "Dr. Umakanta Meher", "", "Occupied", ""),
    (73, "A-229", "Abhishek Shrivastava", "8887820195", "Occupied", ""),
    (74, "A-230", "Mr. Ashish Kumar Kesarwany", "", "Occupied", "Visiting Faculty Bhawna Bagherwal - 9111116600 (key handover pending)"),
    (75, "A-231", "VACANT", "", "Vacant", "Vacant Cabin"),
    (76, "A-232", "Vijay Kumar Patel", "9026050579", "Occupied", ""),
    (77, "A-233", "Suchismita Patra", "9540610053", "Occupied", ""),
    (78, "A-234", "Rahul Kumar Chaturvedi", "8858709096 / 8299748659", "Occupied", ""),

    # Page 2
    (79, "A-235", "Dr. Shahana Gajala Qureshi", "8770762947", "Occupied", ""),
    (80, "A-236", "Swati Chauhan", "6398505154", "Occupied", ""),
    (81, "A-237", "Anil Kumar Shukla", "9918094075", "Occupied", ""),
    (82, "A-238", "Dr. Juhi Yasmeen", "8273788594", "Occupied", ""),
    (83, "A-239", "Dr. Vivek Parashar", "", "Occupied", ""),
    (84, "A-240", "Dr. Kiran Pandey", "9179948303", "Alloted", ""),
    (85, "A-241", "Dr A Balaji", "9444433518", "Occupied", ""),
    (86, "A-242", "Dr. Siddharth S Chouhan", "", "Occupied", ""),
    (87, "A-243", "Dr Sivasankaran", "9843856991", "Occupied", ""),
    (88, "A-244", "Dr Ankur Beohar", "9893383443 / 9425704533", "Occupied", ""),
    (89, "A-245", "Dr. Siddartha Maiti", "", "Occupied", ""),
    (90, "A-246", "Dr. Soumitra Keshari Nayak", "9321923010", "Occupied", ""),
    (91, "A-247", "Dr Swagat Samantray", "7978166023", "Occupied", ""),
    (92, "A-248", "Dr. Rajeev", "", "Occupied", ""),
    (93, "A-249", "Dr Sarvanan D", "9865483413", "Occupied", ""),
    (94, "A-250", "Dr Prashant GK", "9910010941", "Occupied", ""),
    (95, "A-301", "Ajay Kumar Bhurjee", "9178913172", "Occupied", ""),
    (96, "A-302", "Akshara Makrariya", "7748836973", "Occupied", ""),
    (97, "A-303", "Prashant Kumar Pandey", "8178376418", "Occupied", ""),
    (98, "A-304", "Dr. Bhakti Parashar", "9826722177", "Occupied", ""),
    (99, "A-305", "Pallabi Sarkar", "6294524861", "Occupied", ""),
    (100, "A-306", "Rajneesh Kumar Patel", "8871235814", "Occupied", ""),
    (101, "A-307", "Shivmanjree Gopaliya", "9891354291", "Occupied", ""),
    (102, "A-308", "Dr. Ramu Pashupathi Suganeshwar", "7899036744", "Occupied", ""),
    (103, "A-309", "Dr. Virendra Singh Kushwah", "7415869616", "Occupied", ""),
    (104, "A-310", "Susant Kumar Panigrahi", "8249232450", "Occupied", ""),
    (105, "A-311", "Suchetana Sadhukhan", "9748005527", "Occupied", ""),
    (106, "A-312", "Dr Ganeshan R", "8610285129", "Occupied", ""),
    (107, "A-313", "Avirup Das", "9674927124", "Occupied", ""),
    (108, "A-314", "Dr. A. SIRAJUDEEN", "9043787298", "Occupied", "Dr. Sonal Gupta"),
    (109, "A-315", "Anita Yadav", "9977588551", "Occupied", ""),
    (110, "A-316", "Dr OP Pahadi", "9583085832", "Occupied", ""),
    (111, "A-317", "Dr Pradeep Kumar Mishra", "9926170794", "Occupied", ""),
    (112, "A-318", "Dr Bhumika Choksi", "7016527953", "Occupied", ""),
    (113, "A-319", "Dr. Anjali Mathur", "9928986023", "Occupied", ""),
    (114, "A-320", "Rohit Sharma", "9131960256", "Occupied", ""),
    (115, "A-321", "Dr. Suresh Dara", "7353268058", "Occupied", ""),
    (116, "A-322", "Dr Anvesh Nella", "9503132874", "Occupied", ""),
    (117, "A-323", "Dr Periyanagi", "9994458455", "Occupied", ""),
    (118, "A-324", "Dr. Vikas Panthi", "9778460751", "Occupied", ""),
    (119, "A-325", "Dr Pradeep Kashyap", "7465967251", "Occupied", ""),
    (120, "A-326", "Dr Ashok K Patel", "", "Occupied", ""),
    (121, "B-301", "Dr. Hariharan R", "9791322178", "Occupied", ""),
    (122, "B-302", "Nilam Venkatakoteswararao", "9177477722", "Occupied", ""),
    (123, "B-303", "Sheerin Kayenat", "7870955315", "Occupied", ""),
    (124, "B-304", "Sumit Mittal", "9318325748", "Occupied", ""),
    (125, "B-305", "Dr. Monika Sankat", "", "Occupied", ""),
    (126, "B-306", "Harshlata Vishwakarma", "8349780109", "Occupied", ""),
    (127, "B-307", "Narottam Das Patel", "9450095800", "Occupied", ""),
    (128, "B-308", "Dr. Nilamadhab Mishra", "7735627711", "Occupied", ""),
    (129, "B-309", "Dr. C. P. Koushik", "9840403316", "Occupied", ""),
    (130, "B-310", "Dr. Kanchan Lata Kashyap", "982733258", "Occupied", ""),
    (131, "B-311", "Dr. H. AZATH", "9865164505", "Occupied", ""),
    (132, "B-312", "Xavier Suresh", "9486915394", "Occupied", ""),
    (133, "B-313", "Dr A V R Mayuri", "9441438843", "Occupied", ""),
    (134, "B-314", "Dr. Chandan Kumar Behera", "9039490306", "Occupied", ""),
    (135, "B-315", "Dr. Ajeet Singh", "9805075085", "Occupied", ""),
    (136, "A-401", "Benevatho Jaison A", "9994066779", "Occupied", ""),
    (137, "A-402", "Dr Komarasamy G", "9715614081", "Occupied", ""),
    (138, "A-403", "Dr. K. Murugeswari", "9994276824", "Occupied", ""),
    (139, "A-404", "Dr. SUBHASH CHANDRA PATEL", "7905407837", "Occupied", ""),
    (140, "A-405", "Saravanan J", "9047240141", "Occupied", ""),
    (141, "A-406", "Abdul Rashid", "8109171886", "Occupied", ""),
    (142, "A-407", "Hemlata Gangwar", "9766001510", "Occupied", ""),
    (143, "A-408", "Dr. M. Suresh", "", "Occupied", "Associate Professor"),
    (144, "A-409", "Shiv Shankar Prasad Shukla", "8349390186", "Occupied", ""),
    (145, "A-410", "Ajay Kumar Phulre", "8770450967 / 9009218023", "Occupied", ""),
    (146, "A-411", "M. SURESH nirmala", "9962212030", "Occupied", ""),
    (147, "A-412", "Pushpdant Jain", "9437786562", "Occupied", ""),
    (148, "A-413", "Jitendra Pratap Singh Mathur", "9893536675", "Occupied", ""),
    (149, "A-414", "G L Balaji", "9994613458", "Occupied", "Dr. Shantanu Mandal"),
    (150, "A-415", "Dr. Ganeshan G.", "", "Occupied", ""),
    (151, "A-416", "Handover Pending", "", "Handover Pending", "Handover Pending"),
    (152, "A-417", "Handover Pending", "", "Handover Pending", "Handover Pending"),
    (153, "A-418", "Handover Pending", "", "Handover Pending", "Handover Pending"),
    (154, "A-419", "Handover Pending", "", "Handover Pending", "Handover Pending"),
    (155, "A-420", "Handover Pending", "", "Handover Pending", "Handover Pending"),
    (156, "A-421", "Handover Pending", "", "Handover Pending", "Handover Pending"),
    (157, "A-422", "Handover Pending", "", "Handover Pending", "Handover Pending"),
    (158, "A-423", "Handover Pending", "", "Handover Pending", "Handover Pending"),
    (159, "A-424", "Handover Pending", "", "Handover Pending", "Handover Pending"),
    (160, "A-425", "Handover Pending", "", "Handover Pending", "Handover Pending"),
    (161, "A-426", "Handover Pending", "", "Handover Pending", "Handover Pending"),

    # Page 3
    (162, "B-401", "Saurabh Bhargava", "8901539669", "Occupied", ""),
    (163, "B-402", "Dr. Sathish Kumar L.", "9597200240", "Occupied", ""),
    (164, "B-403", "Dr. S. Kannan", "", "Occupied", ""),
    (165, "B-404", "Devraj Vishnu", "9475451245", "Occupied", ""),
    (166, "B-405", "Dr Ankur Jain", "7415259169", "Occupied", ""),
    (167, "B-406", "Dr. M. Maragatharajan", "9003613484", "Occupied", ""),
    (168, "B-407", "Dr. Anand Motwani", "8818965776", "Occupied", ""),
    (169, "B-408", "Rabia Musheer", "9479967401", "Occupied", ""),
    (170, "B-409", "Sonali Shrivastava", "9045914940", "Occupied", ""),
    (171, "B-410", "Neetu Kalra", "9479661282", "Occupied", ""),
    (172, "B-411", "Dr. Ankush Tharkar", "8087181373", "Occupied", ""),
    (173, "B-412", "E. NIRMALA", "8778539987", "Occupied", ""),
    (174, "B-413", "Abhay Vidyarthi", "6265754892", "Occupied", ""),
    (175, "B-414", "Karthick S.", "9514264651 / 8103981414", "Occupied", ""),
    (176, "B-415", "Manisha Singh", "9425005177", "Occupied", ""),
    (177, "C-401", "Dr. Nilesh Kunhare", "9685251246", "Occupied", ""),
    (178, "C-402", "Joshi Abhishek Dilip", "9421803544", "Occupied", ""),
    (179, "C-403", "Adarsh Patel", "9399414598", "Occupied", ""),
    (180, "C-404", "Dr. Gaurav Soni", "9826018671", "Occupied", ""),
    (181, "A-501", "Dr Saravanan S", "9944059288", "Occupied", ""),
    (182, "A-502", "Ankit Pal", "8586875502", "Occupied", ""),
    (183, "A-503", "Dr. Sandeep Sahu", "9407337972", "Occupied", ""),
    (184, "A-504", "Dr. Raghavendra Mishra", "8085102581", "Occupied", ""),
    (185, "A-505", "Arindam Ghosh", "8328808499", "Occupied", ""),
    (186, "A-506", "B. Mahendran", "7382145827", "Occupied", ""),
    (187, "A-507", "Dipankar Sutradhar", "7308126760", "Occupied", ""),
    (188, "A-508", "Dr. Jyoti Chauhan", "8700502598", "Occupied", ""),
    (189, "A-509", "Humaira Fatima", "7455838246 / 8307962979", "Occupied", ""),
    (190, "A-510", "Dr. Anju Shukla", "9111211104", "Occupied", ""),
    (191, "A-511", "Dr. Manoj Kumar", "8269576451", "Occupied", ""),
    (192, "A-512", "Dr. Atul Aman", "8420862335", "Occupied", ""),
    (193, "A-513", "Animesh Bhandari", "8257041061 / 9007847469", "Occupied", ""),
    (194, "A-514", "Dr. Ravi Verma", "8770995536", "Occupied", ""),
    (195, "A-515", "Ravi Bhatt", "9630400659", "Occupied", ""),
    (196, "A-516", "Handover Pending", "", "Handover Pending", "Handover Pending"),
    (197, "A-517", "Handover Pending", "", "Handover Pending", "Handover Pending"),
    (198, "A-518", "Handover Pending", "", "Handover Pending", "Handover Pending"),
    (199, "A-519", "Handover Pending", "", "Handover Pending", "Handover Pending"),
    (200, "A-520", "Handover Pending", "", "Handover Pending", "Handover Pending"),
    (201, "A-521", "Handover Pending", "", "Handover Pending", "Handover Pending"),
    (202, "A-522", "Handover Pending", "", "Handover Pending", "Handover Pending"),
    (203, "A-523", "Handover Pending", "", "Handover Pending", "Handover Pending"),
    (204, "A-524", "Handover Pending", "", "Handover Pending", "Handover Pending"),
    (205, "A-525", "Handover Pending", "", "Handover Pending", "Handover Pending"),
    (206, "A-526", "Handover Pending", "", "Handover Pending", "Handover Pending"),
    (207, "B-501", "DR. RUDRA KALYAN NAYAK", "9861366884", "Occupied", ""),
    (208, "B-502", "Dr. Dip Mukherjee", "", "Occupied", ""),
    (209, "B-503", "Mayank Sharma", "9826081038", "Occupied", ""),
    (210, "B-504", "Jyoti Badge", "9993945259", "Occupied", ""),
    (211, "B-505", "Dr. Feroz Babu", "", "Occupied", ""),
    (212, "B-506", "Dr. Shiju. E", "", "Occupied", "Dr. Saurabh Mishra"),
    (213, "B-507", "Ms. Geeta Singh", "7680854848", "Occupied", ""),
    (214, "B-508", "Dr. S. K. Das", "", "Occupied", ""),
    (215, "B-509", "Usama Khan", "", "Occupied", ""),
    (216, "B-510", "Mr. Vipin Jain", "", "Occupied", ""),
    (217, "B-511", "Sayed Mohammed Zeeshan", "7004465671", "Occupied", ""),
    (218, "B-512", "Dr. Suneet Joshi", "7748946630", "Alloted", "1 cupboard key handover pending by Dr. Muneeswaran. V"),
    (219, "B-513", "Dr. Shafiul Alom Ahmed", "9706931206", "Occupied", ""),
    (220, "B-514", "Pavan kumar", "8179700264", "Occupied", ""),
    (221, "B-515", "Rajdeep Singh Payal", "9389634514", "Occupied", ""),
    (222, "C-501", "Dr. Ram Kumar", "9770045634", "Occupied", ""),
    (223, "C-502", "Amit Kumar Singh", "8840574075", "Occupied", ""),
    (224, "C-503", "Manickam . A", "9789742540", "Occupied", ""),
    (225, "C-504", "Dr. Sultan Alam", "", "Occupied", ""),
    (226, "C-505", "Vijendra Singh Bramhe", "8954675017", "Occupied", ""),
    (227, "C-506", "Saurav prasad", "9310157546", "Occupied", ""),
    (228, "C-507", "Soumya Sankar Ghosh", "9748581767", "Occupied", ""),
    (229, "C-508", "Ms. Nancy Kumari", "7011745833", "Occupied", ""),
    (230, "C-509", "Dr. Hemraj S.L.", "7387114521", "Occupied", ""),
    (231, "C-510", "Dr. Vinod Kumar Jatav", "8239074693", "Occupied", ""),
    (232, "C-511", "Dr Shweta Saxena", "9893954987", "Occupied", ""),
    (233, "C-512", "Soma Saha", "8269896171", "Occupied", ""),
    (234, "C-513", "Santosh Kumar Tripathy", "8658297935", "Occupied", ""),
    (235, "C-514", "Mr. Sanat Jain", "9893979695", "Occupied", ""),
    (236, "C-515", "Dr. Divya Haridas", "9930594727", "Alloted", ""),
    (237, "C-516", "Dr. G. PRABU KANNA", "9791802829", "Occupied", ""),
    (238, "C-517", "D. SARAVANAN", "9865483413", "Occupied", ""),
    (239, "C-518", "Dr. Rizwan ur Rahman", "9893526322", "Occupied", ""),
    (240, "C-519", "Dr. Vikas Panthi", "9778460751", "Occupied", ""),
    (241, "C-520", "Pankaj Kumar", "9508237322", "Occupied", ""),
    (242, "C-521", "Dr. Pradeep Kumar Mishra", "9926177094", "Occupied", ""),
    (243, "C-522", "Dr. Rajit Nair", "9907694424 / 7000760748", "Occupied", ""),
    (244, "C-523", "Dr. NITIN KUMAR MISHRA", "9826449051", "Occupied", ""),

    # Page 4
    (245, "C-524", "Deep Chandra Upadhyay", "9119935285", "Occupied", ""),
    (246, "C-525", "Priyanka Roy", "8296603348", "Occupied", ""),
    (247, "C-526", "Dr. Trapti Sharma", "9425630895", "Occupied", ""),
    (248, "C-527", "Dr. Ashish Mohan Yadav", "7999836793", "Occupied", ""),
    (249, "C-528", "Dr. Kannan S", "7702672411", "Occupied", ""),
    (250, "C-529", "Dr. S. Periyanayagi", "9994458455", "Occupied", ""),
    (251, "C-530", "Dr. Abha Trivedi", "7839319383", "Occupied", ""),
    (252, "C-531", "Ashok Kumar Baral", "9861999643", "Occupied", ""),
    (253, "C-532", "Dr. KR. SIVABALAN", "9698766754", "Occupied", ""),
    (254, "C-533", "Ujjal Halder", "8981693828", "Occupied", ""),
    (255, "C-534", "Garima Jain", "9302920647", "Occupied", ""),
    (256, "C-535", "Dr. Ashok Patel", "9770890583", "Occupied", ""),
    (257, "C-536", "Satyam ravi", "9646937054", "Occupied", ""),
    (258, "C-537", "Udai Kumar", "7651914458", "Occupied", ""),
    (259, "C-538", "Shilpa Suman", "9693750319", "Occupied", ""),
    (260, "C-539", "PRATOSH KUMAR PAL", "8989806880", "Occupied", ""),
    (261, "C-540", "Prasad Begde", "8225048609", "Occupied", ""),
    (262, "AB-011", "Dr. J. George Chellin Chandran", "9384174987", "Occupied", ""),
    (263, "AB-019 (A)", "Dr. PRADYUMNA YADAV", "8109961099 / 7024111639", "Occupied", ""),
    (264, "AB-019 (B)", "Dr. Debashis Adhikari", "9822347215", "Occupied", ""),
    (265, "AB-019 (C)", "Dr. Poonkuntran S", "9894432890", "Occupied", ""),
    (266, "AB-019 (D)", "VACANT", "", "Vacant", "Vacant"),
    (267, "AB-019 (E)", "VACANT", "", "Vacant", "Vacant"),
    (268, "AB-019 (H)", "VACANT", "", "Vacant", "Vacant"),
    (269, "AB-019 (I)", "VACANT", "", "Vacant", "Proposed for Secy. Of DSW"),
    (270, "AB-019 (J)", "VACANT", "", "Vacant", "Proposed for Secy. Of SCSE"),
    (271, "AB-019 (k)", "VACANT", "", "Vacant", "Proposed for Secy. Of SEEE"),
    (272, "AB-019 (L)", "Mr. ANIL MEWADA", "9131094751", "Occupied", "Secy. of Registrar"),
    (273, "ADMISSION OFFICE-01", "Dr. YOGESH SHUKLA", "9479877102", "Occupied", "Admission Office"),
    (274, "ADMISSION OFFICE-02", "Dr. Neha Choubey", "9713606045", "Occupied", "Admission Office"),
    (275, "ADMISSION OFFICE-03", "Mayank Gupta", "7722993939", "Occupied", "Admission Office"),
    (276, "PAT OFFICE-01", "Dr. Shriram R", "7358194673", "Occupied", "Placement & Training Office"),
    (277, "PAT OFFICE-02", "Dr J MANIKANDAN", "7871174176", "Occupied", "Placement & Training Office"),
    (278, "PAT OFFICE-03", "Dr. S. Ananthakumaran", "9842221962", "Occupied", "Placement & Training Office"),
    (279, "PAT OFFICE-04", "R. Sukumar", "9962029293", "Occupied", "Placement & Training Office"),
    (280, "PAT OFFICE-05", "Dr. Sharad Chandra Tripathi", "7697867027", "Occupied", "Placement & Training Office"),
    (281, "PAT OFFICE-06", "Dr. Anirban Bhowmick", "9547155428", "Occupied", "Placement & Training Office"),
    (282, "PAT OFFICE-07", "Dr. Hariharasitaraman. S", "9940295262", "Occupied", "Placement & Training Office"),
    (283, "PAT OFFICE-CR", "Conference Room", "", "Occupied", "Placement & Training Conference Room"),
    (284, "PAT OFFICE-08", "Rajendra Mahanandia", "9438659192", "Occupied", "Placement & Training Office"),
    (285, "AB-110", "Dr. Divya Haridas", "9930594727", "Occupied", ""),
    (286, "AB-306", "Dr. Abha Gupta & Dr. Juhi Kesarwani", "", "Occupied", "Shared Cabin: (1) Dr. Abha Gupta (2) Dr. Juhi Kesarwani"),
    (287, "AB-310", "Mr. RAVI KUMAR SINGH", "", "Occupied", ""),
    (288, "AB-406", "Priyanka Mishra", "9140871509", "Occupied", "Shared Cabin"),
    (289, "AB-406", "Dr S. VAIRACHILAI", "8106813402", "Occupied", "Shared Cabin"),
    (290, "AB-410", "Dr Kamlesh Chandravanshi", "9009217763", "Occupied", "Shared Cabin"),
    (291, "AB-410", "P. Narendra Babu", "6281571216 / 9553773487", "Occupied", "Shared Cabin"),
    (292, "AB-506", "Mr. Vikas Kumar Jain", "9981008680", "Occupied", "Shared Cabin"),
    (293, "AB-506", "Mr. Narendra Kumar", "8968945650", "Occupied", "Shared Cabin"),
    (294, "AB-510", "Dr. Anil Kumar Yadav", "9479499566", "Occupied", "Shared Cabin"),
    (295, "AB-510", "M.R. Thiyagu Priyadharsan", "9994115629", "Occupied", "Shared Cabin"),
    (296, "AB-206", "VACANT", "", "Vacant", "Proposed for Project Funded"),
    (297, "AB-307", "VACANT", "", "Vacant", "Proposed for Project Funded"),
    (298, "AB-507", "Dr. SHISHIR KUMAR SHANDILYA", "9009972032", "Occupied", ""),
    (299, "LIBRARY-01", "Mr. Santanu Mandal", "9233184705", "Occupied", "Library Temporary arrangement"),
    (300, "LIBRARY-02", "Dr. Sumit Som", "", "Occupied", "Library"),
    (301, "LIBRARY-03", "Dr. Sanjay Pan", "", "Occupied", "Library"),
    (302, "LIBRARY-04", "Dr. Sanjeev Nayak", "", "Occupied", "Library"),
    (303, "LIBRARY-05", "Dr. Shweta Singh", "", "Occupied", "Library"),
    (304, "LIBRARY-06", "Dr. Saurabh Mishra", "7394999590", "Occupied", "Library"),
    (305, "LIBRARY-07", "Dr. Ravindra Prasad", "", "Occupied", "Library"),
    (306, "LIBRARY-08", "Dr. Saurabh kumar morya", "9532437348", "Occupied", "Library (DOJ: 06/09/2023)"),
    (307, "LIBRARY-09", "Dr. P.V.N. Kishor", "9553773590", "Occupied", "Library (DOJ: 08/09/2023)"),
    (308, "LIB/FAC-01", "Dr. Kashinath", "9730951876", "Occupied", "Asst. Professor SCSE"),
    (309, "LIB/FAC-02", "Dr. Santosh Kumar Bahl", "9373410389", "Occupied", "Asst. Prof. SASL Maths"),
    (310, "LIB/FAC-03", "Dr. Dipanjana Hazra", "9340355344", "Occupied", "Asst. Prof. SASL Physics"),
    (311, "LIB/FAC-04", "Dr. Kiran Kumar Behra", "8267808230", "Occupied", "Asst. Prof. SASL Maths"),
    (312, "LIB/FAC-05", "Dr. Gounder Thangamani Jayaram", "8110019705", "Occupied", "Assistant Professor SASL-Physics"),
    (313, "LIB/FAC-06", "Dr. Hemanta Kalita", "8811039996", "Occupied", "Assistant Professor SASL-Maths"),
]

def determine_location(cabin_no):
    c = cabin_no.upper().strip()
    if c.startswith("G-"):
        return {"block": "Ground Floor", "floor": "Ground Floor", "building": "Academic Wing G", "fullLocation": "Ground Floor, G-Wing"}
    if c.startswith("A-1"):
        return {"block": "Block A", "floor": "1st Floor", "building": "Academic Block A", "fullLocation": "Block A, 1st Floor"}
    if c.startswith("A-2"):
        return {"block": "Block A", "floor": "2nd Floor", "building": "Academic Block A", "fullLocation": "Block A, 2nd Floor"}
    if c.startswith("A-3"):
        return {"block": "Block A", "floor": "3rd Floor", "building": "Academic Block A", "fullLocation": "Block A, 3rd Floor"}
    if c.startswith("A-4"):
        return {"block": "Block A", "floor": "4th Floor", "building": "Academic Block A", "fullLocation": "Block A, 4th Floor"}
    if c.startswith("A-5"):
        return {"block": "Block A", "floor": "5th Floor", "building": "Academic Block A", "fullLocation": "Block A, 5th Floor"}
    if c.startswith("B-3"):
        return {"block": "Block B", "floor": "3rd Floor", "building": "Academic Block B", "fullLocation": "Block B, 3rd Floor"}
    if c.startswith("B-4"):
        return {"block": "Block B", "floor": "4th Floor", "building": "Academic Block B", "fullLocation": "Block B, 4th Floor"}
    if c.startswith("B-5"):
        return {"block": "Block B", "floor": "5th Floor", "building": "Academic Block B", "fullLocation": "Block B, 5th Floor"}
    if c.startswith("C-4"):
        return {"block": "Block C", "floor": "4th Floor", "building": "Academic Block C", "fullLocation": "Block C, 4th Floor"}
    if c.startswith("C-5"):
        return {"block": "Block C", "floor": "5th Floor", "building": "Academic Block C", "fullLocation": "Block C, 5th Floor"}
    if c.startswith("AB-0"):
        return {"block": "Academic Block (AB)", "floor": "Ground Floor", "building": "Academic Block AB", "fullLocation": "Academic Block AB, Ground Floor"}
    if c.startswith("AB-1"):
        return {"block": "Academic Block (AB)", "floor": "1st Floor", "building": "Academic Block AB", "fullLocation": "Academic Block AB, 1st Floor"}
    if c.startswith("AB-2"):
        return {"block": "Academic Block (AB)", "floor": "2nd Floor", "building": "Academic Block AB", "fullLocation": "Academic Block AB, 2nd Floor"}
    if c.startswith("AB-3"):
        return {"block": "Academic Block (AB)", "floor": "3rd Floor", "building": "Academic Block AB", "fullLocation": "Academic Block AB, 3rd Floor"}
    if c.startswith("AB-4"):
        return {"block": "Academic Block (AB)", "floor": "4th Floor", "building": "Academic Block AB", "fullLocation": "Academic Block AB, 4th Floor"}
    if c.startswith("AB-5"):
        return {"block": "Academic Block (AB)", "floor": "5th Floor", "building": "Academic Block AB", "fullLocation": "Academic Block AB, 5th Floor"}
    if "ADMISSION" in c:
        return {"block": "Admin / Offices", "floor": "Ground Floor", "building": "Admission Office", "fullLocation": "Admission Office, Main Administrative Area"}
    if "PAT" in c:
        return {"block": "Admin / Offices", "floor": "Placement Wing", "building": "PAT Office", "fullLocation": "Placement & Training (PAT) Office"}
    if "LIBRARY" in c or "LIB" in c:
        return {"block": "Library / Academic", "floor": "Library Block", "building": "Central Library", "fullLocation": "Central Library Building"}
    return {"block": "Academic Wing", "floor": "Campus Block", "building": "Academic Complex", "fullLocation": "Academic Complex"}

parsed = []
for sno, cabin, name, phone, status, remark in raw_entries:
    loc = determine_location(cabin)
    norm_status = status.strip()
    if norm_status.lower() in ["occupied"]:
        norm_status = "Occupied"
    elif norm_status.lower() in ["alloted", "allotted"]:
        norm_status = "Allotted"
    elif norm_status.lower() in ["vacant"]:
        norm_status = "Vacant"
    elif "pending" in norm_status.lower():
        norm_status = "Handover Pending"
    
    parsed.append({
        "id": sno,
        "sno": sno,
        "cabinNo": cabin,
        "name": name,
        "phone": phone,
        "status": norm_status,
        "remark": remark,
        "block": loc["block"],
        "floor": loc["floor"],
        "building": loc["building"],
        "fullLocation": loc["fullLocation"]
    })

print(f"Total faculty cabin records: {len(parsed)}")

# Save to backend database folder as json
backend_dir = r"d:\Workspace\ProjectChanges\backend\database"
os.makedirs(backend_dir, exist_ok=True)
json_path = os.path.join(backend_dir, "faculty_cabins.json")
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(parsed, f, indent=2, ensure_ascii=False)

# Save to frontend data folder as JS module
frontend_dir = r"d:\Workspace\ProjectChanges\frontend\src\data"
os.makedirs(frontend_dir, exist_ok=True)
js_path = os.path.join(frontend_dir, "facultyCabins.js")
with open(js_path, "w", encoding="utf-8") as f:
    f.write("// Faculty & Proctor Cabin Directory for VIT Bhopal University\n")
    f.write(f"export const FACULTY_CABINS = {json.dumps(parsed, indent=2, ensure_ascii=False)};\n\n")
    f.write("""export const CABIN_BLOCKS = [
  'All Blocks',
  'Ground Floor',
  'Block A',
  'Block B',
  'Block C',
  'Academic Block (AB)',
  'Admin / Offices',
  'Library / Academic'
];

export const CABIN_STATUSES = [
  'All Status',
  'Occupied',
  'Allotted',
  'Vacant',
  'Handover Pending'
];
""")

print("Successfully written files!")
