// ====================== 변수 선언 ======================
// 메인 보드 배열
const ROWS = 20;
const COLS = 10;
let board = Array.from({length: ROWS}, () => Array(COLS).fill(0));

// 모든 블럭의 모양을 저장하는 배열
let block_arr = [[[]],
                [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // 1 : I mino (하늘색)
                [[2, 2], [2, 2]],                                         // 2 : O mino (노란색)
                [[3, 3, 0], [0, 3, 3], [0, 0, 0]],                        // 3 : Z mino (빨간색)
                [[0, 4, 4], [4, 4, 0], [0, 0, 0]],                        // 4 : S mino (초록색)
                [[5, 0, 0], [5, 5, 5], [0, 0, 0]],                        // 5 : J mino (파란색)
                [[0, 0, 6], [6, 6, 6], [0, 0, 0]],                        // 6 : L mino (주황색)
                [[0, 7, 0], [7, 7, 7], [0, 0, 0]]];                       // 7 : T mino (보라색)
                         
// 색상 매핑 표
const colors = ["", "cyan", "yellow", "red", "green", "blue", "orange", "purple"];

// 점수 계산 테이블
const scoreTable = [0, 100, 300, 500, 800];
// 점수와 지운 라인 저장 변수
let score = 0;
let totalLinesCleared = 0;

// 현재 블럭의 모양, 위치 등을 저장하는 변수
let currentType = 0;
let currentBlock = null;
let currentX = 0;
let currentY = 0;
let currentState = 0 // 현제 블럭의 상태를 나타내는 변수. 처음 상태는 0이며, 오른쪽으로 회전할 때마다 +1씩 상태가 변한다.

// 홀드한 블럭의 모양
let holdType = 0;
let canHold = true; // 홀드는 한 블럭당 1번만 가능하므로 무한 홀드를 방지하기 위한 플래그를 선언한다.

// 타이머 변수
let dropTimer = null;

// 벽차기(Wall Kick) 테스트게이스 테이블
// I미노 테스트케이스
const SRS_WALL_KICK_I ={
    "0->1": [[0, 0], [-2, 0], [ 1, 0], [-2,  1], [ 1, -2]], // 0 -> R
    "1->0": [[0, 0], [ 2, 0], [-1, 0], [ 2, -1], [-1,  2]], // R -> 0
    "1->2": [[0, 0], [-1, 0], [ 2, 0], [-1, -2], [ 2,  1]], // R -> 2
    "2->1": [[0, 0], [ 1, 0], [-2, 0], [ 1,  2], [-2, -1]], // 2 -> R
    "2->3": [[0, 0], [ 2, 0], [-1, 0], [ 2, -1], [-1,  2]], // 2 -> L
    "3->2": [[0, 0], [-2, 0], [ 1, 0], [-2,  1], [ 1, -2]], // L -> 2
    "3->0": [[0, 0], [ 1, 0], [-2, 0], [ 1,  2], [-2, -1]], // L -> 0
    "0->3": [[0, 0], [-1, 0], [ 2, 0], [-1, -2], [ 2,  1]]  // 0 -> L
};
// 그 외 블럭의 테스트케이스
const SRS_WALL_KICK_NORMAL ={
    "0->1": [[0, 0], [-1, 0], [-1, -1], [0,  2], [-1,  2]], // 0 -> R
    "1->0": [[0, 0], [ 1, 0], [ 1,  1], [0, -2], [ 1, -2]], // R -> 0
    "1->2": [[0, 0], [ 1, 0], [ 1,  1], [0, -2], [ 1, -2]], // R -> 2
    "2->1": [[0, 0], [-1, 0], [-1, -1], [0,  2], [-1,  2]], // 2 -> R
    "2->3": [[0, 0], [ 1, 0], [ 1, -1], [0,  2], [ 1,  2]], // 2 -> L
    "3->2": [[0, 0], [-1, 0], [-1,  1], [0, -2], [-1, -2]], // L -> 2
    "3->0": [[0, 0], [-1, 0], [-1,  1], [0, -2], [-1, -2]], // L -> 0
    "0->3": [[0, 0], [ 1, 0], [ 1, -1], [0,  2], [ 1,  2]]  // 0 -> L
};

// 넥스트 블럭들을 저장하는 배열
let next = [];
let bag = [];

// 락 딜레이(Lock Delay) 제어 변수
let isLocking = false;          // 현재 바닥에 닿아서 굳어가는 중인지 체크하는 플래그
let lockDelayTimer = null;      // 0.5초 타이머를 담을 변수
let lockStartTime = 0;          // 처음 바닥에 닿은 '절대 시간'을 기록
const LOCK_DELAY_MS = 500;      // 바닥에 닿은 후 굳기까지의 기본 여유 시간 (0.5초)
const MAX_LOCK_DELAY_MS = 3000; // 꼼수 방지용 최대 버티기 시간 (3초)

// 게임 시작과 게임 오버 판단 변수
let isGameStarted = false;
let isGameOver = false;

// 타이머 제어 변수
let gameStartTime = 0;
let playTimerInterval = null;

// 정지 제어 변수
let isPaused = false;
let pausedTime = 0;

// 사운드 파일
const soundMove = new Audio('media/sound/move.ogg');
const soundRotate = new Audio('media/sound/rotate.ogg');
const soundDrop = new Audio('media/sound/drop.ogg');
const soundClear = new Audio('media/sound/clear.wav');
const soundHold = new Audio('media/sound/hold.wav');
// 볼륨 조절
soundMove.volume = 0.1;
soundRotate.volume = 0.1;
soundDrop.volume = 0.2;
soundClear.volume = 0.2;
soundHold.volume = 0.1;

const bgm = new Audio('media/sound/bgm.mp3');
bgm.loop = true; // 루프 설정
bgm.volume = 0.1;

// ====================== 로직 변수 ======================
// 테트리스 가방 규칙에 따라 랜덤한 가방을 생성하는 함수
function generateBag(){
    let bag = [1, 2, 3, 4, 5, 6, 7];
    
    // 배열을 랜덤하게 섞는 자바스크립트 트릭
    bag.sort(() => Math.random() - 0.5); 
    
    return bag;
}

// 가방에서 넥스트 배열로 블럭을 옮겨오고 다음 블럭을 반환하는 함수
function getNextBlock(){
    if(bag.length===0){ // 가방이 비어있으면 다시 채운다.
        bag = generateBag()
    }
    
    if(next.length===0){ // 넥스트 블럭이 비어있으면(처음 게임을 실행하면) 가방에서 블럭 5개를 꺼내온다.
        for(let i=0; i<5; i++){
        let temp = bag.shift();
            next.push(temp);
        }
    }

    // 넥스트 배열에서 다음 블럭을 가져온다.
    let block = next.shift();
    next.push(bag.pop());
    
    return block;
}

// 블럭 생성 함수
function spawnBlock(){
    currentType = getNextBlock()
    currentBlock = block_arr[currentType];
    currentState = 0;
    currentX = 3;
    currentY = -1;

    // 게임 오버 판정
    if(!isValidPosition(currentBlock, board, currentX, currentY)){
        isGameOver = true;

        // 중력 타이머롸 락 딜레이 타이머 종료
        clearInterval(dropTimer);
        if(lockDelayTimer){
            clearTimeout(lockDelayTimer);
        }
        clearInterval(playTimerInterval);

        setTimeout(() =>{
            document.getElementById("gameover-screen").style.display = "flex";
        }, 100);

        bgm.pause();

        saveRanking();
    }
}

// 게임 오버 시 랭킹을 저장하는 함수
function saveRanking(){
    let currentUser = localStorage.getItem("CurrentUser") || sessionStorage.getItem("CurrentUser");

    // 로그인 상태가 아니라면 점수를 기록하지 않고 함수 종료
    if(!currentUser){
        return;
    }

    let ranking = JSON.parse(localStorage.getItem("TetrisRanking")) || [];

    ranking.push({player : currentUser, score : score});

    ranking.sort((a, b) => b.score - a.score);

    ranking = ranking.slice(0, 10);

    localStorage.setItem("TetrisRanking", JSON.stringify(ranking));
}

// 현재 블럭을 홀드하는 함수
function holdBlock(){
    if(!canHold){
        return;
    }

    canHold = false;

    if(holdType===0){ // 홀드 칸이 비어있는 경우 (게임 시작 후 첫 홀드)
        holdType = currentType; // 현재 블럭을 홀드 칸에 넣고
        spawnBlock();           // 새로운 블럭을 뽑아온다.
    }
    else{ // 홀드 칸에 이미 블럭이 있는 경우 (서로 맞교환)
        let temp = currentType;
        currentType = holdType;
        holdType = temp;

        // 맞교환한 블럭의 모양과 위치, 회전 상태를 맨 처음 스폰 상태로 초기화한다.
        currentBlock = block_arr[currentType];
        currentState = 0;
        currentX = 3;
        currentY = -1;
    }
}

// 블럭이 targetX, targetY 위치로 이동해도 안전한지 검사하는 함수
function isValidPosition(block, board, targetX, targetY){
    const N = block.length;

    // 블럭의 배열을 순회한다. (4x4 or 3x3 or 2x2)
    for(let y=0; y<N; y++){
        for(let x=0; x<N; x++){
            // 블럭 배열에서 0인 부분(빈 공간)은 충돌 검사를 할 필요가 없다.
            if(block[y][x]===0){
                continue;
            }

            // 메인 게임보드 위에서 블럭을 구성하는 셀이 위치할 절대 좌표
            let absoluteX = targetX + x;
            let absoluteY = targetY + y;

            // 좌우 벽이나 바닥과 충돌할 경우 false 반환
            if(absoluteX<0 || absoluteX>=10 || absoluteY>=20){
                return false;
            }

            // 메인 게임보드에 이미 쌓여있는 블럭들과 충돌할 경우 false 반환
            if(absoluteY>=0 && board[absoluteY][absoluteX]!==0){
                return false;
            }
        }
    }
    // 위의 조건들에 해당하지 않을 경우 유요한 위치이므로 true 반환
    return true;
}

// Wall Kick 규칙에 따라 블럭이 회전 가능한지 판단하고 회전시키는 함수
function wallkickRotate(direction){
    const N = currentBlock.length;

    // 회전된 상태를 담을 배열
    const rotated = Array.from({length: N}, () => Array(N).fill(0));

    let before_rotate = currentState;
    let after_rotate = currentState;

    if(direction===1){ // direction이 1이면 시계방향 회전
        for(let y=0; y<N; y++){
            for(let x=0; x<N; x++){
                // 원본의 (y, x) 위치의 값이, 회전 후에는 (x, N - 1 - y)로 이동한다.
                rotated[x][N-1-y] = currentBlock[y][x];
            }
        }
        after_rotate = (before_rotate+1) % 4;
    }
    else{ // direction이 1이 아니면 반시계방향 회전
        for(let y=0; y<N; y++){
            for(let x=0; x<N; x++){
                // 원본의 (y, x) 위치의 값이 반시계 회전 시 (N - 1 - x, y)로 이동한다.
                rotated[N-1-x][y] = currentBlock[y][x];
            }
        }
        after_rotate = (before_rotate+3) % 4;
    }

    // --- 벽차기 테스트 분기 처리 ---
    let test_cases;

    if(currentType===1){ // I 블럭일 경우
        test_cases = SRS_WALL_KICK_I[`${before_rotate}->${after_rotate}`];
    }
    else if(currentType===2){ // O 블럭일 경우
        test_cases = [[0, 0]];
    }
    else{ // 그 외 블럭일 경우
        test_cases = SRS_WALL_KICK_NORMAL[`${before_rotate}->${after_rotate}`];
    }

    // --- 충돌 검사 및 적용 루프 ---
    for(let i=0; i<test_cases.length; i++){
        let testX = currentX + test_cases[i][0];
        let testY = currentY + test_cases[i][1];

        // 해당 좌표가 안전하다면?
        if(isValidPosition(rotated, board, testX, testY)){
            currentBlock = rotated;        // 1. 블럭 모양 적용
            currentX = testX;              // 2. 밀려난 X 좌표 적용
            currentY = testY;              // 3. 밀려난 Y 좌표 적용
            currentState = after_rotate;   // 4. 새로운 회전 상태 적용
            
            return true; // 성공했으므로 true를 반환하고 함수를 즉시 종료
        }
    }
    return false; // 회전에 실패했으므로 false를 반환
}

// 락 딜레이를 주기 위한 0.5초 타이머 생성 함수
function setLockTimer(){
    if(lockDelayTimer){ // 타이머가 비어있지 않다면
        clearTimeout(lockDelayTimer); // 타이머를 비어준다.
    }
    lockDelayTimer = setTimeout(forceLock, LOCK_DELAY_MS); // 0.5초 뒤 강제로 블럭을 고정하는 함수를 실행하도록 타이머를 셋팅한다.
}

// 락 딜레이동안 조작 시 락 딜레이를 초기화하는 함수
function resetLockTimer(){
    let currentTime = Date.now(); // 시간 계산을 위한 현재 시간

    // 처음 바닥에 닿은지 3초가 넘을 경우 강제 고정
    if(currentTime-lockStartTime>=MAX_LOCK_DELAY_MS){
        forceLock();
    }
    else{
        setLockTimer(); // 아직 3초가 지나지 않았다면 0.5초 타이머를 다시 시작
    }
}

// 바닥에 닿은 상태에서 허공으로 미끄러졌을 때 타이머 취소 함수
function cancelLockDelay(){
    isLocking = false; // 현재 바닥에 닿지 않았음을 나타냄
    if(lockDelayTimer){
        clearTimeout(lockDelayTimer);
    }
    lockDelayTimer = null;
}

// 강제 고정 및 다음 블럭 스폰 함수
function forceLock(){
    if(!currentBlock){ // 블럭이 아직 없는 상태에서 함수 종료
        return;
    }
    cancelLockDelay();
    lockBlock();
    checkLineClear();
    spawnBlock();
    canHold = true;
    renderBoard();
}

// 바닥 체크 로직 함수
function checkGroundAndLock(){
    if(!isValidPosition(currentBlock, board, currentX, currentY+1)){
        if(!isLocking){ // 현재 블럭이 바닥이고, lock 상태가 false인 경우 
            isLocking = true;
            lockStartTime = Date.now();
            setLockTimer();
        }
    }
    else{ 
        if(isLocking){ // 현재 블럭이 바닥이 아님에도 lock 상태가 true인 경우 (땅에 닿았다가 미끄러진 경우)
            cancelLockDelay();
        }
    }
}

// 고스트 블럭의 Y좌표를 구하여 반환하는 함수
function getGhostY(){
    if(!currentBlock){
        return 0;
    }

    let ghostY = currentY;

    while(isValidPosition(currentBlock, board, currentX, ghostY+1)){
        ghostY++;
    }

    return ghostY;
}

// 중력 타이머 생성 함수
function moveDown(){
    if(isValidPosition(currentBlock, board, currentX, currentY+1)){
        currentY++;
    }
    checkGroundAndLock(); // 바닥에 닿았는지, 닿지 않았는지를 판단해 락 딜레이 타이머를 켜거나 끈다.
    renderBoard();
}

// 라인이 완성되었는지 확인하는 함수
function checkLineClear(){
    let lineClearedInThisTurn = 0;

    for(let y=ROWS-1; y>=0; y--){
        // 행이 완성됐는지 검사
        let isRowFull = board[y].every(cell => cell !== 0);

        if(isRowFull){
            // board 배열에서 y번째 행을 통째로 삭제한다.
            board.splice(y, 1);

            // 삭제된 만큼 보드의 맨 위에 0으로 채워진 새 행을 추가한다.
            board.unshift(Array(COLS).fill(0));

            // 위쪽 요소들의 인덱스 번호가 1씩 이동하므로 검사 인덱스를 제자리에 붙잡아두기 위해 y에 1을 더한다.
            y++;

            lineClearedInThisTurn++;

            playSound(soundClear);
        }
    }

    // 지워진 줄이 있다면 점수를 계산한다.
    if(lineClearedInThisTurn>0){
        calculateScore(lineClearedInThisTurn);
    }
}

// 점수 계산 함수
function calculateScore(lines){
    score += scoreTable[lines];
    totalLinesCleared += lines;

    // console.log(`지운 줄: ${lines} | 현재 점수: ${score} | 총 지운 줄 수: ${totalLinesCleared}`);
            
    document.getElementById("score-val").innerText = score;
    document.getElementById("lines-val").innerText = totalLinesCleared;
}

// 블럭 고정 함수
function lockBlock(){
    const N = currentBlock.length;
    for(let y=0; y<N; y++){
        for(let x=0; x<N; x++){
            if(currentBlock[y][x]!==0){
                let absoluteY = currentY + y;
                let absoluteX = currentX + x;
                if(absoluteY>=0){
                    board[absoluteY][absoluteX] = currentBlock[y][x];
                }
            }
        }
    }
}

// 타이머 시간 업데이트 함수
function updateTime(){
    if(isGameOver){
        return;
    }

    let elapsed = Date.now() - gameStartTime;

    let minutes = Math.floor(elapsed/60000);
    let seconds = Math.floor((elapsed%60000)/1000);
    let centisecond = Math.floor((elapsed%1000)/10);

    let secStr = seconds.toString().padStart(2, "0");
    let csStr = centisecond.toString().padStart(2, "0");

    document.getElementById("time-main").innerText = `${minutes}:${secStr}`;
    document.getElementById("time-cs").innerText = `.${csStr}`
}

// ESC 정지 토글 함수
function togglePaused(){
    if(isGameOver){
        return;
    }

    isPaused = !isPaused; // 상태 반전
    const pauseScreen = document.getElementById("pause-screen");

    if(isPaused){
        pauseScreen.style.display = "flex";

        clearInterval(dropTimer);
        if(lockDelayTimer){
            clearTimeout(lockDelayTimer);
        }
        clearInterval(playTimerInterval);

        pausedTime = Date.now()

        bgm.pause();
    }
    else{
        pauseScreen.style.display = "none";

        // 시간 보정
        gameStartTime += (Date.now()-pausedTime);

        // 멈췄던 타이머들 재가동
        dropTimer = setInterval(moveDown, 500);
        playTimerInterval = setInterval(updateTime, 10);
        if(isLocking){
            lockStartTime += (Date.now() - pausedTime);
            setLockTimer();
        }

        bgm.play();
    }
}

// "계속하기" 버튼 함수
function resumeGame(){
    if(isPaused){
        togglePaused();
    }
}

// "나가기" 버튼 함수
function quitGame(){
    if(confirm("정말 게임을 종료하시겠습니까? (진행 상황이 모두 초기화됩니다.)")){
        location.reload();
    }
}

// 오디오 재생을 위한 헬퍼 함수
// 연속으로 누를 때 소리가 씹히지 않도록 재생 위치를 0초로 돌린 뒤 재생한다.
function playSound(audioObj){
    // 게임이 일시 정지 상태일 때는 소리도 나지 않도록 한다.
    if(isPaused){
        return; 
    }

    audioObj.currentTime = 0; // 재생 시작 위치를 맨 처음으로 초기화
    audioObj.play().catch(error =>{
        // (참고) 브라우저 정책상, 사용자가 화면을 한 번이라도 클릭/터치하기 전에는 자동 오디오 재생이 막혀있어 에러가 뜰 수 있으므로 이를 무시하도록 한다.
        console.log("Audio play blocked by browser policy:", error);
    });
}

// 키보드 입력 리스너
document.addEventListener("keydown", (event) =>{
    // 게임 시작 화면, 게임 오버 화면, 게임 정지 화면이 아닐 경우(게임을 플레이할 경우) 브라우저 조작을 멈추도록 한다.
    if(isGameStarted && !isGameOver && !isPaused){
        const gameKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Spacebar"];
        if(gameKeys.includes(event.key)){
            // 브라우저의 HTML 요소에 기본적으로 정의된 고유 동작을 취소하는 함수
            event.preventDefault(); // 브라우저의 기본 스크롤 동작을 강제로 취소시킴
        }
    }

    if(!isGameStarted){
        return;
    }

    if(event.key==="Escape"){
        togglePaused();
        return;
    }

    if(!currentBlock || isGameOver || isPaused){ // 블럭이 없으거나 게임 오버거나 일시 정지 중이라면 조작 불가
        return;
    }

    let moved = false; // 조작 성공 여부 플래그

    if(event.key==="ArrowLeft"){
        if(isValidPosition(currentBlock, board, currentX-1, currentY)){
            currentX--;
            moved = true;
            playSound(soundMove);
        }
    }
    else if(event.key==="ArrowRight"){
        if(isValidPosition(currentBlock, board, currentX+1, currentY)){
            currentX++;
            moved = true;
            playSound(soundMove);
        }
    }
    else if(event.key==="ArrowDown"){
        moveDown(); // 즉시 한 칸 내림
    }
    else if(event.key==="ArrowUp"){
        if(wallkickRotate(1)){
            moved = true;
            playSound(soundRotate);
        }
    }
    else if(event.key==="Control"){
        if(wallkickRotate(0)){
            moved = true;
            playSound(soundRotate);
        }
    }
    else if(event.key==="Shift"){
        holdBlock();
        playSound(soundHold);
    }
    else if(event.key===" " || event.key==="Spacebar"){
        currentY = getGhostY();
        forceLock(); // 락 딜레이 무시
        playSound(soundDrop);
    }

    // 키보드 조작으로 블럭이 위치나 모양을 바꿀 경우
    if(moved){
        if(isLocking){
            resetLockTimer();
        }
        checkGroundAndLock();
    }

    renderBoard();
})

// 렌더링 함수
function renderBoard(){
    // 보드에 고정된 블럭들 그리기
    for(let y=0; y<ROWS; y++){
        for(let x=0; x<COLS; x++){
            const cell = document.getElementById(`main-board-${y}-${x}`);
            const img = document.getElementById(`main-board-${y}-${x}-img`);
            const blockValue = board[y][x];

            if(blockValue===0){
                cell.style.backgroundColor = "black"; // 빈 공간은 까맣게 유지
                img.style.display = "none";           // 블럭 이미지는 숨김
            } 
            else{
                cell.style.backgroundColor = "transparent"; // 배경색 투명화
                img.src = `media/tetris_img/cell/cell${blockValue}.png`;        // 번호에 맞는 이미지 삽입
                img.style.display = "block";                // 이미지 표시
                img.style.opacity = "1";
            }
        }
    }

    // 고스트 블럭 그리기
    if(currentBlock){
        let ghostY = getGhostY();
        const N = currentBlock.length;

        for(let y=0; y<N; y++){
            for(let x=0; x<N; x++){
                if(currentBlock[y][x]!==0){
                    let absoluteY = ghostY + y;
                    let absoluteX = currentX + x;

                    // 화면 안에 있는 셀들만 그린다.
                    if(absoluteY>=0){
                        const cell = document.getElementById(`main-board-${absoluteY}-${absoluteX}`);
                        const img = document.getElementById(`main-board-${absoluteY}-${absoluteX}-img`);
                        
                        if(img){
                            cell.style.backgroundColor = "transparent";
                            img.src = `media/tetris_img/cell/ghost.png`;
                            img.style.display = "block";
                            img.style.opacity = "0.3"; // 고스트 블럭은 투명도 30%
                        }
                    }
                }
            }
        }
    }

    // 떨어지고 있는 현재 블럭 덧그리기
    if(currentBlock){
        const N = currentBlock.length;

        for(let y=0; y<N; y++){
            for(let x=0; x<N; x++){
                if(currentBlock[y][x]!==0){
                    let absoluteY = currentY + y;
                    let absoluteX = currentX + x;

                    // 화면 안에 있는 셀들만 그린다.
                    if(absoluteY>=0){
                        const cell = document.getElementById(`main-board-${absoluteY}-${absoluteX}`);
                        const img = document.getElementById(`main-board-${absoluteY}-${absoluteX}-img`);
                                
                        if(img){
                             cell.style.backgroundColor = "transparent";
                             img.src = `media/tetris_img/cell/cell${currentBlock[y][x]}.png`;
                             img.style.display = "block";
                             img.style.opacity = "1"; // 현재 블럭은 투명도 100%로 고스트 블럭 덮어쓰기
                        }
                    }
                }
            }
        }
    }

    // NEXT 블럭 5개 이미지
    for(let k=0; k<5; k++){
        const nextType = next[k]; // 1~7번 블럭 숫자
        const imgElement = document.getElementById(`next-img-${k}`);
        
        if(nextType>0 && nextType<=7){
            // media 폴더 안의 1.png ~ 7.png 파일로 소스 교체
            imgElement.src = `media/tetris_img/block/block${nextType}.png`; 
            imgElement.style.display = "block"; // 숨김 해제
        }
        else{
            imgElement.style.display = "none";
        }
    }

    const holdImgElement = document.getElementById("hold-img");
    if(holdType>0 && holdType<=7){
        if(canHold){
            holdImgElement.src = `media/tetris_img/block/block${holdType}.png`;
        }
        else{
            holdImgElement.src = `media/tetris_img/block/block${holdType}_temp.png`;
        }
        holdImgElement.style.display = "block";
    } 
    else{
        holdImgElement.style.display = "none";
    }
}

// 보드 배열 생성 함수
function createTable(rows, cols, targetElement){
    let html = '';
    for(let i=0; i<rows; i++){
        html += '<tr>';
        for(let j=0; j<cols; j++){
            const cellId = `${targetElement.id}-${i}-${j}`;
            // id를 부여하여 렌더링 시 빠르게 찾아 색칠할 수 있도록 한다.
            // 예) main-board-0-0
            html += `<td id="${cellId}"><img id="${cellId}-img" src="" style="display: none;"></td>`;
            // 이미지를 띄울 img 태그를 미리 넣고 숨겨둔다.
        }
        html += '</tr>';
    }
    targetElement.innerHTML = html;
}

// 브라우저가 켜지자마자 무대를 미리 세팅
window.onload = function(){
    // 중앙 메인 보드 생성
    const mainBoard = document.getElementById("main-board");
    createTable(20, 10, mainBoard);

    // 오른쪽 넥스트 보드 5개 생성
    const nextBoardsContainer = document.getElementById("next-boards");
    for(let k=0; k<5; k++){
        let newImageBox = document.createElement("div");
        newImageBox.className = "image-box";
        newImageBox.id = `next-box-${k}`; 
        
        let imgTag = document.createElement("img");
        imgTag.id = `next-img-${k}`;
        imgTag.src = ""; 
        imgTag.style.display = "none"; 
        
        newImageBox.appendChild(imgTag);
        nextBoardsContainer.appendChild(newImageBox);
    }

    // HOLD 이미지 태그 생성
    const holdBox = document.getElementById("hold-box");
    let holdImgTag = document.createElement("img");
    holdImgTag.id = "hold-img";
    holdImgTag.src = "";
    holdImgTag.style.display = "none";
    holdBox.appendChild(holdImgTag);

    // 첫 블럭을 준비하고 화면에 그려둔다. (시간은 아직 흐르지 않음)
    spawnBlock();
    renderBoard();
};

// 유저가 "게임 시작" 버튼을 누르면 엔진을 작동
function start(){
    // 1. 시작 오버레이 화면을 치운다.
    document.getElementById("start-screen").style.display = "none";
    
    // 2. 키보드 조작 잠금을 해제한다.
    isGameStarted = true;

    // 3. 중력과 타이머를 작동시킨다.
    dropTimer = setInterval(moveDown, 500);
    gameStartTime = Date.now();
    playTimerInterval = setInterval(updateTime, 10);

    bgm.play();
}