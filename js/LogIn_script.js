let password_count = 6; // 비밀번호 입력 기회

// 로그인 함수
function Login(){
    // 입력창에 입력된 아이디와 비밀번호
    const UserIdInput = document.getElementById("id").value;
    const UserPasswordInput = document.getElementById("password").value;
    // 아이디, 비밀번호 입력 상태 메시지
    const IdMsgElement = document.getElementById("id-msg");
    const PwMsgElement = document.getElementById("password-msg");

    // 아이디와 비밀번호가 입력되지 않을 경우
    if(UserIdInput.trim() === ""){
        IdMsgElement.innerText = "아이디를 입력하세요";
        IdMsgElement.style.color = "#ff6b6b"; /* 다크 모드에 최적화된 가독성 높은 적색 */
        return;
    }
    if(UserPasswordInput.trim() === ""){
        PwMsgElement.innerText = "비밀번호를 입력하세요";
        PwMsgElement.style.color = "#ff6b6b";
        return;
    }

    // 아이디와 비밀번호가 입력되었으나 그 값이 잘못된 경우
    if(localStorage.getItem(UserIdInput)==null){ // 입력한 아이디가 로컬스토리지에 존재하지 않을 경우
        alert("존재하지 않는 아이디입니다");
        document.getElementById("id").value = "";
        return;
    }
    else if(localStorage.getItem(UserIdInput)!=UserPasswordInput){ // 아이디가 존재하나 비밀번호가 틀릴 경우
        password_count--;
        if(password_count===0){
            alert("비밀번호 입력 횟수를 초과하였습니다!\n아이디를 초기화합니다. 다시 가입해 주세요");
            localStorage.removeItem(UserIdInput);
            password_count = 6
        }
        else{
            alert("비밀번호가 틀립니다\n남은 입력 횟수 : " + password_count);
        }
        return;
    }
            
    // 올바른 아이디와 비밀번호가 입력된 경우
    alert("로그인 성공")

    // 로그인 유지 체크박스가 체크되어 있는지 확인
    const isKeepLogin = document.getElementById("keep-login").checked;

    // 체크 여부에 따라 현재 로그인한 유저 정보를 다른 곳에 저장
    if (isKeepLogin){
        // 체크 O: 브라우저를 껐다 켜도 유지되는 localStorage에 저장
        localStorage.setItem("CurrentUser", UserIdInput);
    } else{
        // 체크 X: 브라우저를 끄면 날아가는 sessionStorage에 저장
        sessionStorage.setItem("CurrentUser", UserIdInput);
    }

    location.replace("main.html");
}

function resetId(){
    const UserIdInput = document.getElementById("id").value;
    const IdMsgElement = document.getElementById("id-msg");

    IdMsgElement.innerText = "";
}

function resetPw(){
    const UserPasswordInput = document.getElementById("password").value;
    const PwMsgElement = document.getElementById("password-msg");

    PwMsgElement.innerText = "";
}