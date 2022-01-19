# ITZY tube
* https://itzytube.herokuapp.com/
* Backend : Node.js(Express)/MongoDB/AWS
* Frontend : Javascript/Pug/SCSS
---------------------------------------
## 기능 설명
1. Create
* 동영상 파일을 썸네일, 제목, 설명, 태그와 함께 업로드
* 댓글 작성
2. Read
* 홈페이지에서 전체 동영상 조회
* 동영상 업로드한 유저 이름 클릭시 해당 유저가 업로드한 영상 조회
3. Update
* 자신이 업로드한 동영상 정보 수정
* 자신의 프로필 수정
* 동영상 끝까지 시청 시 조회수 자동 업데이트
4. Delete
* 자신이 업로드한 동영상 삭제
* 자신이 작성한 댓글 삭제
5. Player
* 페이지 로드 시 동영상의 전체 길이 출력
* 동영상의 재생 시간 출력
* 동영상 재생 상태를 나타내는 진행 바, 이를 통해 재생 시간 조절 가능
* 볼륨 크기를 나타내는 진행 바, 이를 통해 볼륨 조절 가능
* 동영상 플레이어에서 스페이스바 입력 시 재생/정지
* 동영상 플레이어에서 F 키 입력 시 전체화면 전환
* 동영상 플레이어에서 ESC 입력 시 전체화면 해제
* 동영상 플레이어에서 좌우 방향키 입력 시 재생 시간 5초씩 이동
* 동영상 플레이어에서 상하 방향키 입력 시 볼륨 조절
6. etc.
* 제목을 통해 특정 동영상 검색
* 웹캠을 이용한 5초짜리 숏 비디오 녹화와 썸네일 자동 생성, 해당 영상과 썸네일 다운로드 (FFmpeg 사용)
* 로그인, 업로드, 댓글 작성 등의 기능 사용 시 화면 상단에 정상 작동여부 알림 메세지 출력
