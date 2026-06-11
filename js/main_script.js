// 페이지가 열릴 때 실행
window.onload = function(){
    // sessionStorage 또는 localStorage에서 'CurrentUser'를 찾는다
    const loggedInUser = sessionStorage.getItem("CurrentUser") || localStorage.getItem("CurrentUser");

    // 로그인 되지 않았을 때(게스트) 표시되는 span
    const guestMenu = document.getElementById("guest-menu");
    // 로그인 되었을 때(유저) 표시되는 span
    const userMenu = document.getElementById("user-menu");
    const userIdDisplay = document.getElementById("user-id-display");

    // 로그인 상태일 때: 게스트 메뉴 숨기고, 유저 메뉴 켜기
    if(loggedInUser){
        guestMenu.classList.add("hidden");
        userMenu.classList.remove("hidden");
        
        // 아이디 텍스트 띄워주기
        userIdDisplay.innerText = loggedInUser + "님";
    }
    // 비로그인 상태일 때: 게스트 메뉴 켜고, 유저 메뉴 숨기기
    else{
        guestMenu.classList.remove("hidden");
        userMenu.classList.add("hidden");
    }

    renderRanking(); // 처음 켜졌을 때 한 번 렌더링
    // 1초(1000ms)마다 주기적으로 renderRanking 함수를 혼자 실행시킨다.
    // iframe이 점수를 로컬스토리지에 저장만 해두면, 부모 창이 알아서 1초 뒤에 긁어온다.
    setInterval(renderRanking, 1000);

    // 3초(3000ms)마다 회전 함수 실행
    setInterval(rotateImage, 2000);
}

// 로그아웃 함수
function Logout(){
    // 양쪽 저장소에서 currentUser 모두 파기 (회원 DB가 삭제되는 건 아님)
    sessionStorage.removeItem("CurrentUser");
    localStorage.removeItem("CurrentUser");
            
    alert("로그아웃 되었습니다.");
    // 새로고침하여 화면 상태를 갱신
    location.reload(); 
}

// 랭킹 표시 함수
function renderRanking(){
    const rankingListElement = document.querySelector(".ranking-list");
    rankingListElement.innerHTML = ""; // 기존에 그려진 더미 데이터(기본값)를 싹 비움

    let ranking = JSON.parse(localStorage.getItem("TetrisRanking")) || [];

    // 기록이 하나도 없을 경우의 예외 처리
    if (ranking.length === 0){
        rankingListElement.innerHTML = "<li style='color: #777; text-align: center;'>아직 기록이 없습니다.</li>";
        return;
    }

    // 배열을 순회하며 <li> 태그를 생성해 화면에 붙여넣기
    ranking.forEach((entry, index) =>{
        let li = document.createElement("li");
            
        // 점수에 천 단위 콤마(,) 찍어준다.
        let formattedScore = entry.score.toLocaleString(); 
            
        li.innerHTML = `<span class="player">${entry.player}</span> 
                        <span class="score">${formattedScore}</span>`;
            
        rankingListElement.appendChild(li);
    });
}

// 네비게이터 서브 메뉴 클릭 시, 해당 아코디언을 자동으로 열어주는 기능
document.querySelectorAll('.sub-nav a').forEach(link =>{
    link.addEventListener('click', function(event){
        // 클릭한 a 태그의 href 속성(예: #wiki-controls)을 가져온다.
        const targetId = this.getAttribute('href'); 
        
        // 이동할 목적지(details 태그)를 찾는다.
        const targetElement = document.querySelector(targetId);
        
        // 목적지가 존재하고, details 태그가 맞다면
        if(targetElement && targetElement.tagName === 'DETAILS'){
            // 강제로 열림(open) 상태로 만든다.
            targetElement.setAttribute('open', ''); 
        }
    });
});

// --- 블록 설명 부분의 이미지 회전 구현 ---
let currentDegree = 0;

// 90도씩 즉각 회전시키는 함수
function rotateImage(){
    // 현재 각도에 90도를 더하고 360도로 나눈 나머지 계산 (0 -> 90 -> 180 -> 270 -> 0)
    currentDegree = (currentDegree + 90) % 360;
    
    // 화면에 있는 모든 블록 이미지(class="block-img")를 실시간으로 전부 불러온다.
    const allBlockImages = document.querySelectorAll(".block-img");
    
    // 배열(NodeList)을 순회하면서 모든 이미지들의 CSS transform 속성을 일괄 변경한다.
    allBlockImages.forEach(img =>{
        img.style.transform = `rotate(${currentDegree}deg)`;
    });
}