let is_duplication = true; // 아이디가 중복인지 확인
let possible_password = false; // 비밀번호 안전성을 기준으로 사용 가능한 비밀번호인지 확인
let is_same_password = false; // 비밀번호 입력창과 비밀번호 확인 입력창에 입력된 내용이 일치한지 확인 

// 가입하기 함수
function SignUp(){
    // 입력창에 입력된 아이디와 비밀번호
    const UserIdInput = document.getElementById("id").value;
    const UserPasswordInput = document.getElementById("password").value;
    const CheckPasswordInput = document.getElementById("password-check").value;
    // 아이디, 비밀번호 입력 상태 메시지
    const IdMsgElement = document.getElementById("id-msg");
    const PwMsgElement = document.getElementById("password-msg");
    const CheckPwMsgElement = document.getElementById("check-password-msg");

    if(UserIdInput.trim() === ""){
        IdMsgElement.innerText = "아이디를 입력하세요";
        IdMsgElement.style.color = "#ff6b6b";
        return;
    }

    if(is_duplication){
        IdMsgElement.innerText = "아이디 중복을 확인하세요";
        IdMsgElement.style.color = "#ff6b6b";
         return;
    }

    if(UserPasswordInput.trim() === ""){
        PwMsgElement.innerText = "비밀번호를 입력하세요";
        PwMsgElement.style.color = "#ff6b6b";
        return;
    }

    if(!possible_password){
        PwMsgElement.innerText = "사용 불가능한 비밀번호입니다";
        PwMsgElement.style.color = "#ff6b6b";
        return;
    }

    if(CheckPasswordInput.trim() === ""){
        CheckPwMsgElement.innerText = "비밀번호 확인란을 입력하세요";
        CheckPwMsgElement.style.color = "#ff6b6b";
        return;
    }

    if(!is_same_password){
        CheckPwMsgElement.innerText = "비밀번호가 같은지 다시 한번 확인하세요";
        CheckPwMsgElement.style.color = "#ff6b6b";
        return;
    }

    alert("회원가입이 완료되었습니다!\n로그인 페이지로 이동합니다.")
    // 로컬스토리지에 유저의 아이디와 비밀번호 저장
    localStorage.setItem(UserIdInput, UserPasswordInput);
    location.replace("LogIn.html");
}

// 비밀번호 입력창에 글자를 입력할 때마다 안전성을 확인하는 함수
function checkPasswordStrength(){
    const pw = document.getElementById("password").value;
    const PwMsgElement = document.getElementById("password-msg");

    // 정규표현식을 사용하여 pw에 영문, 숫자, 특수문자 포함 여부를 확인
    const hasLetter = /[a-zA-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>-]/.test(pw);

    // 비밀번호 입력창에 아무것도 입력되지 않은 경우 메시지를 지움
    if (pw.length === 0){
        PwMsgElement.innerText = "";
        return;
    }

    // 위험 : 길이가 8자 미만이거나, 영문/숫자 조합이 아닌 경우
    if (pw.length < 8 || !(hasLetter && hasNumber)){
        PwMsgElement.innerText = "위험 : 비밀번호는 8자 이상의 영문/숫자 조합이여야 합니다";
        PwMsgElement.style.color = "#ff6b6b";
        possible_password = false
    } 
    // 안전 : 8자 이상 + 영문 + 숫자 + 특수문자 모두 포함
    else if (hasLetter && hasNumber && hasSpecial){
        PwMsgElement.innerText = "안전 : 사용 가능한 비밀번호입니다";
        PwMsgElement.style.color = "#55efc4";
        possible_password = true
    } 
    // 보통 : 8자 이상 + 영문 + 숫자 조합이지만 특수문자는 없는 경우
    else{
        PwMsgElement.innerText = "보통 : 특수문자 사용을 권장합니다";
        PwMsgElement.style.color = "#fab1a0";
        possible_password = true
    }
}

// 비밀번호 입력창과 비밀번호 확인 입력창에 입력된 내용이 일치한지 확인하는 함수
function checkPasswordSame(){
    const UserPasswordInput = document.getElementById("password").value;
    const CheckPasswordInput = document.getElementById("password-check").value;
    const CheckPwMsgElement = document.getElementById("check-password-msg");

    // 비밀번호 입력창과 비밀번호 확인 입력창에 입력된 내용이 일치하지 않은 경우
    if(UserPasswordInput !== CheckPasswordInput){
        CheckPwMsgElement.innerText = "비밀번호가 일치하지 않습니다";
        CheckPwMsgElement.style.color = "#ff6b6b";
        is_same_password = false
    }
    else{
        CheckPwMsgElement.innerText = "비밀번호가 일치합니다";
        CheckPwMsgElement.style.color = "#55efc4";
        is_same_password = true
    }
}

// 아이디 중복 확인 함수
function duplicationCheck(){
    const UserIdInput = document.getElementById("id").value;
    const IdMsgElement = document.getElementById("id-msg");

    // 아무것도 입력하지 않고 누른 경우
    if(UserIdInput.trim() === ""){
        IdMsgElement.innerText = "아이디를 입력하세요";
        IdMsgElement.style.color = "#ff6b6b";
        is_duplication = true;
        return;
    }

    // 아이디가 존재하지 않는 경우
    if(localStorage.getItem(UserIdInput)===null){
        IdMsgElement.innerText = "사용 가능한 아이디입니다";
        IdMsgElement.style.color = "#55efc4";
        is_duplication = false;
    }
    else{
        IdMsgElement.innerText = "이미 존재하는 아이디입니다";
        IdMsgElement.style.color = "#ff6b6b";
        is_duplication = true;
    }
}

// 아이디 입력창 내용이 변경될 때마다 중복 확인 변수를 다시 변경하는 함수
// 이 함수가 없을 경우 중복이 아닌 아이디를 입력하여 중복확인 후 다른 아이디를 작성하여 중복 확인을 회피할 수 있다
function resetDuplication(){
    is_duplication = true; // 다시 중복 확인을 하도록 상태를 잠금
    document.getElementById("id-msg").innerText = ""; // 기존 메시지 지우기
}