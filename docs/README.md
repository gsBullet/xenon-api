
# RetinaLMS



## Indices

* [Admin](#admin)

  * [add admin](#1-add-admin)
  * [admins](#2-admins)
  * [delete admin](#3-delete-admin)
  * [get otp](#4-get-otp)
  * [reset password](#5-reset-password)
  * [update admin](#6-update-admin)
  * [verify login](#7-verify-login)

* [Analitycs](#analitycs)

  * [active user count](#1-active-user-count)
  * [branch & admin](#2-branch-&-admin)
  * [dashboard](#3-dashboard)
  * [group exam courseId and session](#4-group-exam-courseid-and-session)

* [Auth](#auth)

  * [is logged in](#1-is-logged-in)
  * [logout](#2-logout)

* [Branch](#branch)

  * [branch](#1-branch)
  * [branch](#2-branch)
  * [branches](#3-branches)
  * [delete](#4-delete)

* [Chapter](#chapter)

  * [add access to group by groupId and chapterId](#1-add-access-to-group-by-groupid-and-chapterid)
  * [chapter](#2-chapter)
  * [chapter by id](#3-chapter-by-id)
  * [chapter by subjectId](#4-chapter-by-subjectid)
  * [delete](#5-delete)
  * [remove content](#6-remove-content)
  * [update](#7-update)
  * [update content order by chapterId](#8-update-content-order-by-chapterid)

* [Contents](#contents)

  * [add access  to lecture/chapter/question solve](#1-add-access--to-lecturechapterquestion-solve)
  * [create](#2-create)
  * [delete by id](#3-delete-by-id)
  * [mark as complete](#4-mark-as-complete)
  * [search](#5-search)
  * [signed key request](#6-signed-key-request)
  * [update by id](#7-update-by-id)

* [Course](#course)

  * [course](#1-course)
  * [course](#2-course)
  * [course by courseId](#3-course-by-courseid)
  * [courses](#4-courses)
  * [subject completion](#5-subject-completion)

* [Exam](#exam)

  * [add answer](#1-add-answer)
  * [add question by examId](#2-add-question-by-examid)
  * [create](#3-create)
  * [delete by id](#4-delete-by-id)
  * [exam result publish](#5-exam-result-publish)
  * [export exam](#6-export-exam)
  * [finish exam](#7-finish-exam)
  * [get all exam by courseId](#8-get-all-exam-by-courseid)
  * [get by examId](#9-get-by-examid)
  * [get result by examId](#10-get-result-by-examid)
  * [get result by examId for student](#11-get-result-by-examid-for-student)
  * [mark answer](#12-mark-answer)
  * [merit list](#13-merit-list)
  * [my scoreboard](#14-my-scoreboard)
  * [publish all](#15-publish-all)
  * [remove question by examId and questionId](#16-remove-question-by-examid-and-questionid)
  * [retake exam](#17-retake-exam)
  * [scoreboard by studentId](#18-scoreboard-by-studentid)
  * [start exam](#19-start-exam)
  * [update by id](#20-update-by-id)

* [File](#file)

  * [files](#1-files)

* [Gateway](#gateway)

  * [sms gateway](#1-sms-gateway)
  * [sms gateway](#2-sms-gateway)

* [Group](#group)

  * [access status change by groupId](#1-access-status-change-by-groupid)
  * [add exam to group](#2-add-exam-to-group)
  * [add students to group](#3-add-students-to-group)
  * [all students by groupId](#4-all-students-by-groupid)
  * [create](#5-create)
  * [get by groupId](#6-get-by-groupid)
  * [groups by session and courseId](#7-groups-by-session-and-courseid)
  * [remove exam from group by id and examId](#8-remove-exam-from-group-by-id-and-examid)
  * [remove student by groupId and studentId](#9-remove-student-by-groupid-and-studentid)
  * [update exam by examId](#10-update-exam-by-examid)

* [Lecture](#lecture)

  * [add access to group by groupId and lectureId](#1-add-access-to-group-by-groupid-and-lectureid)
  * [delete](#2-delete)
  * [lecture](#3-lecture)
  * [lecture by id](#4-lecture-by-id)
  * [lectures by subjectId](#5-lectures-by-subjectid)
  * [remove content](#6-remove-content-1)
  * [update](#7-update-1)
  * [update content order by lectureId](#8-update-content-order-by-lectureid)

* [Notification](#notification)

  * [create notification](#1-create-notification)
  * [delete notification from student](#2-delete-notification-from-student)
  * [get by Id](#3-get-by-id)
  * [seen](#4-seen)

* [Question](#question)

  * [Update question by Id](#1-update-question-by-id)
  * [create](#2-create-1)
  * [delete question by Id](#3-delete-question-by-id)
  * [export csv](#4-export-csv)
  * [question by Id](#5-question-by-id)
  * [search](#6-search)

* [Question solve](#question-solve)

  * [add access to group by groupId and questionSolveId](#1-add-access-to-group-by-groupid-and-questionsolveid)
  * [delete](#2-delete-1)
  * [question solve](#3-question-solve)
  * [question-solve by id](#4-question-solve-by-id)
  * [question-solve by subjectId](#5-question-solve-by-subjectid)
  * [remove content](#6-remove-content-2)
  * [update](#7-update-2)
  * [update content order by id](#8-update-content-order-by-id)

* [Student](#student)

  * [Add student](#1-add-student)
  * [add course (studentId)](#2-add-course-(studentid))
  * [delete students](#3-delete-students)
  * [export](#4-export)
  * [export by groupId](#5-export-by-groupid)
  * [forgot password](#6-forgot-password)
  * [login](#7-login)
  * [otp](#8-otp)
  * [profile](#9-profile)
  * [profile](#10-profile)
  * [profile by _id](#11-profile-by-_id)
  * [profile by _id](#12-profile-by-_id)
  * [remove course](#13-remove-course)
  * [set password](#14-set-password)
  * [status](#15-status)
  * [students](#16-students)
  * [update status multiple](#17-update-status-multiple)

* [Subject](#subject)

  * [delete by id](#1-delete-by-id)
  * [get by id](#2-get-by-id)
  * [lecrure/chapter/questionSolve order change by subjectId](#3-lecrurechapterquestionsolve-order-change-by-subjectid)
  * [start subject](#4-start-subject)
  * [subject](#5-subject)
  * [subjects by courseId](#6-subjects-by-courseid)
  * [update by id](#7-update-by-id-1)


--------


## Admin



### 1. add admin



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{api}}/admin/add
```



***Body:***

```js        
{
    "username": "8801797459061",
    "firstName": "Supto",
    "lastName": "Maruf",
    "password": "password123",
    "roles": ["moderator"]
}
```



### 2. admins



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/admin/
```



### 3. delete admin



***Endpoint:***

```bash
Method: DELETE
Type: 
URL: {{api}}/admin/delete/8801797459061
```



### 4. get otp



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{api}}/admin/otp
```



***Body:***

```js        
{
    "handle": "8801710027639",
    "password": "password",
    "viaEmail": false
}
```



### 5. reset password



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/admin/reset-passowrd
```



***Body:***

```js        
{
    "oldPassword": "iamsadat642",
    "newPassword": "password123"
}
```



### 6. update admin



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/admin/update/5fc2205d6fcf3b8571ecfa72
```



***Body:***

```js        
{
  "firstName": "Md. "
}
```



### 7. verify login



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{api}}/admin/verify-login
```



***Body:***

```js        
{
  "hash": "0cef6bdf6a891f9f892542d1fd08cda0b22ce831d6799cd9bdb79f76b804aae6.1613824693377",
  "handle": "8801710027639",
  "otp": "647200"
}
```



## Analitycs



### 1. active user count



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/analitycs/active-users
```



### 2. branch & admin



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/analitycs/branch-and-admin
```



### 3. dashboard



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/analitycs/dashboard/2020
```



### 4. group exam courseId and session



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/analitycs/group/5fec3f4f7b8c9199d1902cae/exam/2020
```



## Auth



### 1. is logged in



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/auth/is-logged-in
```



### 2. logout



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/auth/logout
```



## Branch



### 1. branch



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{api}}/branch
```



***Body:***

```js        
{
    "name": "Uttara",
    "division": "Dhaka",
    "address": "Farmgate",
    "phone": "8801710585567"
}
```



### 2. branch



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/branch/5fa8f042424dbb18b8f96b95
```



***Body:***

```js        
{
    "name": "Uttara",
    "code": "1",
    "phone": "8801710585567"
}
```



### 3. branches



***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{api}}/branch
```



***Body:***

```js        
{
    "name": "Uttara",
    "code": "5",
    "phone": "8801710585567"
}
```



### 4. delete



***Endpoint:***

```bash
Method: DELETE
Type: 
URL: {{api}}/branch/5fe06b8f8c0cc31e181e82f7
```



## Chapter



### 1. add access to group by groupId and chapterId



***Endpoint:***

```bash
Method: PATCH
Type: 
URL: {{api}}/chapter/5fba0900929f4617fceb20f9/add-access/5fbe41251a425a5a64e94a4f
```



### 2. chapter



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{api}}/chapter
```



***Body:***

```js        
{
  "name": "Math",
  "subjectId": "5fb2296ad9ed05b1340524d2",
  "description": "dsdjhkbajgvsio"
}
```



### 3. chapter by id



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/chapter/5fddb83dc9a90bf5fab38478
```



### 4. chapter by subjectId



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/chapter/by-subject-id/5fb2296ad9ed05b1340524d2
```



### 5. delete



***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{api}}/chapter/5fbe41251a425a5a64e94a4f/delete
```



***Body:***

```js        
{
  "name": "Math",
  "subjectId": "5fb2296ad9ed05b1340524d2"
}
```



### 6. remove content



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/chapter/5fb202b5c188b067a9c1baf0/remove-content
```



***Body:***

```js        
{
  "videoContents": [
    "5fb78d0e70af808169b0fd03"
  ],
  "fileContents": [
    "5fb78d0e70af808169b0fd03"
  ]
}
```



### 7. update



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/chapter/5fbe41251a425a5a64e94a4f/update
```



***Body:***

```js        
{
  "name": "Math",
  "subjectId": "5fb2296ad9ed05b1340524d2"
}
```



### 8. update content order by chapterId



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/chapter/5fb240431ae3b2ca2135f64b/content-order
```



***Body:***

```js        
{
  "videoContents": [
    "5fb78d0e70af808169b0fd03"
  ],
  "fileContents": [
    "5fb78d0e70af808169b0fd03"
  ]
}
```



## Contents



### 1. add access  to lecture/chapter/question solve



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/content/add-access/601b90fb17c441992486a509
```



***Body:***

```js        
{
  "chapterId" : "5fbb9a7d5269b25e3fa3ba5a",
  "lectureId" : "5fbb9a7d5269b25e3fa3b852",
  "questionSolveId": "5fbb9a7d5269b25e3fa3b852"
}
```



### 2. create



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{api}}/content
```



***Body:***

```js        
{
  "title": "Lay Lay",
  "type": "video",
  "URL": "https://www.youtube.com/watch?v=5wyW-w1ikK0",
  "chapters": ["5fc7d73357e14a69fecdecdb"],
  "questionSolves": ["5fc7d73357e14a69fecdecda"],
  "courses": ["5fb20ba2f4398274da611cc2"],
  "lectures": ["5fbe4521b61a6f62e402bfa4"],
  "subjects": ["5fb2296ad9ed05b1340524d2"]
}
```



### 3. delete by id



***Endpoint:***

```bash
Method: DELETE
Type: 
URL: {{api}}/content/delete/5fc8944f5a643c8d6ca76378
```



### 4. mark as complete



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/content/mark-as-complete/5fc3da3c4305d56ae0f46cec
```



***Body:***

```js        
{
  "courseId": "5fc73bb8dc5d7ab2c1d96cce",
  "subjectId": "5fc73bb8dc5d7ab2c1d96cce",
  "type": "video"
}
```



### 5. search



***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{api}}/content/search
```



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| lectureId | 5fb9f935adcf48bc87512957 |  |
| subjectId | 5fb9f901adcf48bc87512956 |  |



***Body:***

```js        
{
  "title": "Fifth",
  "type": "video",
  "key": "asdaw75a",
  "URL": "aousga.aw",
  "chapters": ["5fb240431ae3b2ca2135f64b"],
  "courses": ["5fb20ba2f4398274da611cc2"],
  "lectures": ["5fb202b5c188b067a9c1baf0"],
  "subjects": ["5fb2296ad9ed05b1340524d2"]
}
```



### 6. signed key request



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/content/signed-request
```



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| mimeType | image/png |  |



### 7. update by id



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/content/update/5fc3da3c4305d56ae0f46cec
```



***Body:***

```js        
{
  "title": "One 1"
}
```



## Course



### 1. course



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{api}}/course
```



***Body:***

```js        
{
    "name": "Test",
    "description": "asdas dasdasb as dkasndas dasdl jkas doas",
    "image": "http://gosda.ss",
    "session": "2020"
}
```



### 2. course



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/course/5fa8da8b4623445842f23b98
```



***Body:***

```js        
{
    "name": "Test1"
}
```



### 3. course by courseId



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/course/5fa8da8b4623445842f23b98
```



### 4. courses



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/course
```



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| session | 2020 |  |



### 5. subject completion



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/course/5fc73bb8dc5d7ab2c1d96cce/subject-completion
```



## Exam



### 1. add answer



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/exam/add-answer/5fd0e116ae595163a7cda9cd/group/5fd0e08dae595163a7cda9ca
```



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| offline | true |  |



***Body:***

```js        
{
  "questionId": "5fcced34336aadf5e2e44708",
  "answer": [
    "Ctr+C "
  ]
}
```



### 2. add question by examId



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/exam/add-question/5fb6615b6129bc91660496e4
```



***Body:***

```js        
{
  "questions": [
    {
      "question": "5fb53b242e2ee99d786c07d2",
      "point": "5"
    }
  ]
}
```



### 3. create



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{api}}/exam
```



***Body:***

```js        
{
  "title": "Test Exam 3",
  "courseId": "5fb9f7d5adcf48bc87512952",
  "isPracticeExam": false,
  "passMark": 20,
  "totalMarks": 50,
  "negativeMarkPerQuestion": 0.25,
  "globalPoint": 5,
  "questions": [
    {
      "question": "5fb9fa4cadcf48bc87512959",
      "point": 50
    }
  ]
}
```



### 4. delete by id



***Endpoint:***

```bash
Method: DELETE
Type: 
URL: {{api}}/exam/delete/5fb6615b6129bc91660496e4
```



### 5. exam result publish



***Endpoint:***

```bash
Method: PATCH
Type: 
URL: {{api}}/exam/publish/5fb9fbcaadcf48bc8751295b/student/5fb9f7f7adcf48bc87512954/group/5fb9fbcaadcf48bc8751295b
```



### 6. export exam



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/exam/export/5fd70f681169c1ea10916aba/
```



### 7. finish exam



***Endpoint:***

```bash
Method: PATCH
Type: 
URL: {{api}}/exam/submit/5fec6262e9097afa8c1c535a/group/5fd1a94beec8a664b6c66d44
```



### 8. get all exam by courseId



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/exam/course-id/5fc49bc869c25d2508fa45d7
```



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| lastId | 5fd1b1f2eec8a664b6c66d45 |  |



### 9. get by examId



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/exam/id/5fd1b485eec8a664b6c66d54
```



### 10. get result by examId



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/exam/result/5fb9fbcaadcf48bc8751295b
```



### 11. get result by examId for student



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/exam/result/602a09383aeb40b8dcc1e744/student/by-groupId/5fed6ce3bedf62cb8b658263
```



### 12. mark answer



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/exam/mark-answer/5fb9fbcaadcf48bc8751295b/group/5fb9fbcaadcf48bc8751295b
```



***Body:***

```js        
{
  "questionId": "5fb9fa4cadcf48bc87512959",
  "marks": 10,
  "studentId": "5fb9fa4cadcf48ba87512959"
}
```



### 13. merit list



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/exam/aggregate
```



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| exam | 5fed7f08bedf62cb8b65832e |  |
| exam | 6006619536a771c381a8b6e7 |  |
| group | 5fd0e08dae595163a7cda9ca |  |



### 14. my scoreboard



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/exam/scoreboard
```



### 15. publish all



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/exam/publish-all/6029fb757d5a9fa5fd04c76a/group/5fed6ce3bedf62cb8b658263
```



***Body:***

```js        
{
  "students": ["5fb0a6db485de5e8033ae81a"],
  "sendSms": false
}
```



### 16. remove question by examId and questionId



***Endpoint:***

```bash
Method: PATCH
Type: 
URL: {{api}}/exam/remove-question/5fb6615b6129bc91660496e4/5fb53b242e2ee99d786c07d2
```



### 17. retake exam



***Endpoint:***

```bash
Method: PATCH
Type: 
URL: {{api}}/exam/retake/5fd1b485eec8a664b6c66d54/student-id/5fc72bc685d8c5465bed4c61
```



### 18. scoreboard by studentId



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/exam/scoreboard/5fcb890331e047d7831056f0
```



### 19. start exam



***Endpoint:***

```bash
Method: PATCH
Type: 
URL: {{api}}/exam/start/5fd1b485eec8a664b6c66d54/group-id/5fd0e08dae595163a7cda9ca
```



### 20. update by id



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/exam/update/5fb6615b6129bc91660496e4
```



***Body:***

```js        
{
  "title": "Exam update",
  "isPracticeExam": true,
  "courseId": "5faf8d4ae5d43a62f5bb89f7",
  "passMark": 10,
  "totalMarks": 50,
  "negativeMarkPerQuestion": 0.5,
  "multipleTimesSubmission": true,
  "status": "pending"
}
```



## File



### 1. files



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/file/all
```



## Gateway



### 1. sms gateway



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/gateway/sms
```



### 2. sms gateway



***Endpoint:***

```bash
Method: PUT
Type: RAW
URL: {{api}}/gateway/sms
```



***Body:***

```js        
{
  "gateway": "infobip"
}
```



## Group



### 1. access status change by groupId



***Endpoint:***

```bash
Method: PATCH
Type: 
URL: {{api}}/group/5fed6ce3bedf62cb8b658263/access-status
```



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| status | false |  |
| questionSolveId | 601e6caeac627bc7df843754 |  |



### 2. add exam to group



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/group/5fba0900929f4617fceb20f9/add-exam
```



***Body:***

```js        
{
  "startsAt": "2020-11-20T07:02:33.014Z",
  "duration": 90,
  "examId": "5fc397a030dac834590b3770",
  "addGPA": false,
  "multipleTimesSubmission": false,
  "type": "live",
  "endsAt": "2020-11-20T07:02:33.014Z"
}
```



### 3. add students to group



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/group/5fba0900929f4617fceb20f9/add-student
```



***Body:***

```js        
{
    "usernames": [
        "8801710027630",
        "8801521105226"
    ]
}
```



### 4. all students by groupId



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/group/all/students/5fba0900929f4617fceb20f9/
```



### 5. create



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{api}}/group
```



***Body:***

```js        
{
    "name": "Group A",
    "session": "2020",
    "courseId": "5fb20ba2f4398274da611cc2",
    "image": "adsads.png"
}
```



### 6. get by groupId



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/group/5fed6ce3bedf62cb8b658263
```



### 7. groups by session and courseId



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/group/2020/5fb20ba2f4398274da611cc2
```



### 8. remove exam from group by id and examId



***Endpoint:***

```bash
Method: PATCH
Type: 
URL: {{api}}/group/5fb76a5ed3d13f46089a2b79/remove-exam/5fb6ced7a63606f49159d4ff
```



### 9. remove student by groupId and studentId



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/group/remove-student/5fb0dfe62c9f695496d12a35/
```



***Body:***

```js        
{
    "usernames":["8801710027630", "8801710027638"]
}
```



### 10. update exam by examId



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/group/5fb9f845adcf48bc87512955/update/5fbcf55e4f94f45590aa3b08
```



***Body:***

```js        
{
  "status": "unpublished",
  "addGPA": true,
  "duration": 500,
  "startsAt": "2020-11-25T07:02:33.014Z"
}
```



## Lecture



### 1. add access to group by groupId and lectureId



***Endpoint:***

```bash
Method: PATCH
Type: 
URL: {{api}}/lecture/5fb9f845adcf48bc87512955/add-access/5fbe4521b61a6f62e402bfa4
```



### 2. delete



***Endpoint:***

```bash
Method: DELETE
Type: 
URL: {{api}}/lecture/5fb202b5c188b067a9c1baf0/delete
```



### 3. lecture



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{api}}/lecture
```



***Body:***

```js        
{
  "name": "Math II",
  "subjectId": "5fb2296ad9ed05b1340524d2",
  "description": "dsdjhkbajgvsio"
}
```



### 4. lecture by id



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/lecture/5fb9f935adcf48bc87512957
```



### 5. lectures by subjectId



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/lecture/by-subject-id/5fb2296ad9ed05b1340524d2
```



### 6. remove content



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/lecture/5fb202b5c188b067a9c1baf0/remove-content
```



***Body:***

```js        
{
  "videoContents": [
    "5fb78d0e70af808169b0fd03"
  ],
  "fileContents": [
    "5fb78d0e70af808169b0fd03"
  ]
}
```



### 7. update



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/lecture/5fb202b5c188b067a9c1baf0/update
```



***Body:***

```js        
{
  "name": "Math II",
  "subjectId": "5fb2296ad9ed05b1340524d2"
}
```



### 8. update content order by lectureId



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/lecture/5fb772e2f98d4053560cd597/content-order
```



***Body:***

```js        
{
  "videoContents": [
    "5fb78d0e70af808169b0fd03"
  ],
  "fileContents": [
    "5fb78d0e70af808169b0fd03"
  ]
}
```



## Notification



### 1. create notification



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{api}}/notification
```



***Body:***

```js        
{
  "message": "Dear Xenon Academy user, your verification code is: 088430",
  "type": "notice",
  "info": {
    "id": "5fbcf84a63f8625bf74e4613",
    "action": "created",
    "on": "group"
  },
  "students": [
    "8801521105226"
  ],
  "sms": [
    "8801710027639"
  ]
}
```



### 2. delete notification from student



***Endpoint:***

```bash
Method: DELETE
Type: 
URL: {{api}}/notification/id/6003bde779f5faf7689f93e9
```



### 3. get by Id



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/notification/id/6003c20779f5faf7689f93f8
```



### 4. seen



***Endpoint:***

```bash
Method: PATCH
Type: 
URL: {{api}}/notification/seen/5fbcf83363f8625bf74e4610
```



## Question



### 1. Update question by Id



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/question/update/5fb53b2f2e2ee99d786c07d3
```



***Body:***

```js        
{
  "options": [
    "a",
    "b",
    "c",
    "d"
  ],
  "title": "X is a 96"
}
```



### 2. create


Optional field: subjectId, lectureId, chapterId, sampleAnswer, status, URL, image, file, sampleAnswer, answer


type:{
      SHORT_ANS: 'shortAns',
      PARAGRAPH: 'paragraph',
      MCQ: 'MCQ',
      CHECKBOX: 'checkbox',
}


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{api}}/question/
```



***Body:***

```js        
{
  "questions": [
    {
      "title": "X is 10",
      "type": "MCQ",
      "options": ["a", "b", "c"],
      "answer": ["a"],
      "sampleAnswer": "Optional field",
      "status": "pending",
      "subjectId": "5faf8d4ae5d43a62f5bb89f7",
      "courseId": "5faf8d4ae5d43a62f5bb89f7",
      "lectureId": "5faf8d4ae5d43a62f5bb89f7",
      "chapterId": "5faf8d4ae5d43a62f5bb89f7",
      "URL": ["optional field"],
      "image": ["optional field"],
      "file": ["optional field"],
      "notes": "Hudai"
    }
  ]
}
```



### 3. delete question by Id



***Endpoint:***

```bash
Method: PATCH
Type: 
URL: {{api}}/question/delete/5fb53b2f2e2ee99d786c07d3
```



### 4. export csv



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/question/export
```



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| courseId | 5fae37ab092642ce6e3a431b |  |



### 5. question by Id



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/question/by-id/5fc0c6365e213188dc93366c
```



### 6. search



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/question/search
```



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| courseId | 5fc49bc869c25d2508fa45d7 |  |
| title | new%20question |  |



## Question solve



### 1. add access to group by groupId and questionSolveId



***Endpoint:***

```bash
Method: PATCH
Type: 
URL: {{api}}/question-solve/5fba0900929f4617fceb20f9/add-access/5fbe41251a425a5a64e94a4f
```



### 2. delete



***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{api}}/question-solve/601a97d244b66d2d18ddd1ae/delete
```



***Body:***

```js        
{
  "name": "Math",
  "subjectId": "5fb2296ad9ed05b1340524d2"
}
```



### 3. question solve



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{api}}/question-solve
```



***Body:***

```js        
{
  "name": "Math 2",
  "subjectId": "5fb2296ad9ed05b1340524d2",
  "description": "dsdjhkbajgvsio"
}
```



### 4. question-solve by id



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/question-solve/601a97d244b66d2d18ddd1ae
```



### 5. question-solve by subjectId



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/question-solve/by-subject-id/5fb2296ad9ed05b1340524d2
```



### 6. remove content



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/question-solve/601a97d244b66d2d18ddd1ae/remove-content
```



***Body:***

```js        
{
  "videoContents": [
    "5fb78d0e70af808169b0fd03"
  ],
  "fileContents": [
    "5fb78d0e70af808169b0fd03"
  ]
}
```



### 7. update



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/question-solve/601a97d244b66d2d18ddd1ae/update
```



***Body:***

```js        
{
  "name": "Math",
  "subjectId": "5fb2296ad9ed05b1340524d2"
}
```



### 8. update content order by id



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/question-solve/601a97d244b66d2d18ddd1ae/content-order
```



***Body:***

```js        
{
  "videoContents": [
    "5fb78d0e70af808169b0fd03"
  ],
  "fileContents": [
    "5fb78d0e70af808169b0fd03"
  ]
}
```



## Student



### 1. Add student



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{api}}/student/add-student
```



***Body:***

```js        
{
  "name": "Sadat Sayem",
  "session": "2020",
  "sid": "202015211",
  "username": "8801710027639",
  "contact": "8801710027637",
  "HSCGPA": 4.60,
  "SSCGPA": 5.00,
  "firstTime": true,
  "courses": [
    "5fb15ee4013dbdbaacd3ff5a",
    "5fb20ba2f4398274da611cc2"
  ],
  "branch": "5fb15f00013dbdbaacd3ff5b"
}
```



### 2. add course (studentId)



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/student/add-course
```



***Body:***

```js        
{
    "id": "5fb15f4f013dbdbaacd3ff5c",
    "courses": ["5fb15f00013dbdbaacd3ff5b"]
}
```



### 3. delete students



***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{api}}/student/delete
```



***Body:***

```js        
{
  "students": ["8801710027639"]
}
```



### 4. export



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/student/export
```



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| session | 2020 |  |



### 5. export by groupId



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/student/export/group/5fb0c64e485de5e8033ae81c
```



### 6. forgot password



***Endpoint:***

```bash
Method: PATCH
Type: 
URL: {{api}}/student/forgot-password/8801521105226
```



### 7. login



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{api}}/student/login
```



***Body:***

```js        
{
    "username": "8801777383495",
    "password": "Zubair07"
}
```



### 8. otp



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/student/otp/8801710027639
```



### 9. profile



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/student/profile
```



***Body:***

```js        
{
    "name": "Maruf Supto",
    "HSCGPA": "4.7",
    "SSCGPA": "5",
    "firstTime": true
}
```



### 10. profile



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/student/profile
```



### 11. profile by _id


Only authorized to admin and moderator


***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/student/profile/5faf8d4ae5d43a62f5bb89f7
```



***Body:***

```js        
{
    "name": "Abdullah Al Maruf Supto",
    "HSCGPA": "5",
    "SSCGPA": "5",
    "firstTime": true,
    "session": "2021",
    "sid": "1521105226",
    "branch": "5fa8f042424dbb18b8f96b95",
    "contact": "8801777966321"
}
```



### 12. profile by _id


Only authorized to admin and moderator


***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/student/profile/5fb9f7f7adcf48bc87512954
```



### 13. remove course



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/student/remove-course
```



***Body:***

```js        
{
    "id": "5fa99ff96d16d00d14a9d425",
    "courses": ["5fa9a67cef446f23242a675c"]
}
```



### 14. set password



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/student/set-password
```



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| forgotPassword | true |  |



***Body:***

```js        
{
    "phone": "8801521105226",
    "password": "password1",
    "otp": "750121",
    "hash": "56408e4022c376e075faa7ab0b11a341757a9ef5eee0ef6827da44678fdcadbb.1607433969919"
}
```



### 15. status



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/student/status/5fa99ff96d16d00d14a9d425
```



***Body:***

```js        
{
   "status": "active"
}
```



### 16. students



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/student
```



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| session | 2020 |  |
| username | 8801710027639 |  |



### 17. update status multiple



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/student/status
```



***Body:***

```js        
{
  "status": "active",
  "students": ["8801521105226"]
}
```



## Subject



### 1. delete by id



***Endpoint:***

```bash
Method: DELETE
Type: 
URL: {{api}}/subject/5fc73bb8dc5d7ab2c1d96cce
```



### 2. get by id



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/subject/5fc73bb8dc5d7ab2c1d96cce
```



### 3. lecrure/chapter/questionSolve order change by subjectId



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/subject/5fb174efd022522ca8d28b48/reorder/lecture-chapter
```



***Body:***

```js        
{
  "lectures": ["5fb174efd022522ca8d28b4a"],
  "chapters": ["5fb174efd022522ca8d28b41"],
  "questionSolves": ["5fb174efd022522ca8d28b41"]
}
```



### 4. start subject



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{api}}/subject/start/
```



***Body:***

```js        
{
  "courseId": "5fc73bb8dc5d7ab2c1d96cce",
  "subjectId": "5fc73bb8dc5d7ab2c1d96cce"
}
```



### 5. subject



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{api}}/subject
```



***Body:***

```js        
{
  "name": "Math",
  "image": "ggdfsa.png",
  "courseId": "5fb20ba2f4398274da611cc2",
  "description": "sadasdas dasdhbvasdas djl asdas ljb as das"
}
```



### 6. subjects by courseId



***Endpoint:***

```bash
Method: GET
Type: 
URL: {{api}}/subject/by-course-id/5fb20ba2f4398274da611cc2
```



### 7. update by id



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{api}}/subject/5fc73bb8dc5d7ab2c1d96cce
```



***Body:***

```js        
{
  "name": "Math",
  "image": "ggdfsa.png",
  "description": "sadasdas dasdhbvasdas djl asdas ljb as das"
}
```



---
[Back to top](#retinalms)
> Made with &#9829; by [thedevsaddam](https://github.com/thedevsaddam) | Generated at: 2021-02-24 12:33:33 by [docgen](https://github.com/thedevsaddam/docgen)
