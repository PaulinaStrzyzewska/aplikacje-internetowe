const PIECE_COUNT_SIDE = 4;
let map, marker, piece = []; 
let currentImageDataUrl = null;


document.addEventListener('DOMContentLoaded', () => {
    initMap();
    setupUI();
    buildBoard();
});

function initMap() {
    map = L.map('map').setView([53.4447, 14.53336], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
}

function setupUI() {
    document.getElementById('btn-my-loc').addEventListener('click', requestGeolocation);
    document.getElementById('btn-request-notif').addEventListener('click', requestNotificationPermission);
    document.getElementById('btn-download-map').addEventListener('click', downloadMapAsRaster);   
}

function requestGeolocation() {
    if(!navigator.geolocation) { 
        alert('Geolokalizacja niedostępna'); 
        return; 
    }

    navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        document.getElementById('coords-text').textContent = `${lat}, ${lng}`;
        showMyLocation(lat, lng);
    }, err => {
        alert('Nie udało się pobrać lokalizacji: ' + err.message);
    });
}

function showMyLocation(lat, lng) {
    map.setView([lat, lng], 16);
    if(marker) map.removeLayer(marker);
    marker = L.marker([lat, lng]).addTo(map).bindPopup('Moja lokalizacja').openPopup();
}

function requestNotificationPermission() {
    if(!('Notification' in window)) { 
        alert('Twoja przeglądarka nie obsługuje powiadomień'); 
        return; 
    }
    Notification.requestPermission().then(p => alert('Zgoda na powiadomienia: ' + p));
}

function sendSuccessNotification() {
    if('Notification' in window && Notification.permission === 'granted') {
        new Notification('Gratulacje!', { body: 'Ułożyłeś poprawnie mapę z puzzli!' });
    }
}

async function downloadMapAsRaster() {
    const mapElement = document.getElementById('map');
    document.getElementById('status-text').textContent = 'tworzenie rastra...';
    try {
        const canvas = await html2canvas(mapElement, {useCORS:true, allowTaint:true});
        currentImageDataUrl = canvas.toDataURL('image/png');

        splitCanvasIntoPieces(canvas);
        document.getElementById('status-text').textContent = 'puzzle przygotowane';
    } catch(e) {
        alert('Błąd przy tworzeniu rastra.');
        console.error(e);
        document.getElementById('status-text').textContent = 'błąd';
    }
}

function splitCanvasIntoPieces(canvas) {
    const table = document.getElementById('table');
    table.innerHTML = '';
    pieces = [];

    const board = document.getElementById('board');
    const boardRect = board.getBoundingClientRect();

    const pw = boardRect.width / PIECE_COUNT_SIDE;
    const ph = boardRect.height / PIECE_COUNT_SIDE;

    for (let r=0; r<PIECE_COUNT_SIDE; r++) {
        for (let c=0; c<PIECE_COUNT_SIDE; c++) {
            const index = r * PIECE_COUNT_SIDE + c;
            pieces.push({index, r, c});
        }
    }

    const shuffled = shuffleArray([...pieces]);

    shuffled.forEach(p => {
        const div = document.createElement('div');
        div.className = 'piece';
        div.draggable = true;
        div.dataset.index = p.index;

        div.style.backgroundImage = `url(${currentImageDataUrl})`;
        div.style.backgroundPosition = `-${p.c*pw}px -${p.r*ph}px`;
        div.style.backgroundSize = `${boardRect.width}px ${boardRect.height}px`;
        div.style.width = `${Math.floor(pw)}px`;
        div.style.height = `${Math.floor(ph)}px`;

        div.addEventListener('dragstart', onDragStartPiece);
        table.appendChild(div);
    });

    document.querySelectorAll('.slot').forEach(s => {
        s.innerHTML=''; s.dataset.occupied='false';
    });
}

function shuffleArray(arr) {
    for(let i=arr.length-1; i>0; i--) {
        const j=Math.floor(Math.random()*(i+1));
        [arr[i], arr[j]]=[arr[j],arr[i]];
    }
    return arr;
}

function onDragStartPiece(ev) {
    ev.dataTransfer.setData('text/plain', ev.target.dataset.index);
    ev.dataTransfer.effectAllowed='move';
}

function buildBoard() {
    const board = document.getElementById('board');
    board.innerHTML='';
    for (let i=0; i<PIECE_COUNT_SIDE*PIECE_COUNT_SIDE; i++) {
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.dataset.index = i;
        slot.dataset.occupied='false';
        slot.addEventListener('dragover', e => e.preventDefault());
        slot.addEventListener('drop', onDropToSlot);
        board.appendChild(slot);
    }
}

function onDropToSlot(e) {
    e.preventDefault();
    const pieceIdx = e.dataTransfer.getData('text/plain');
    const pieceEl = document.querySelector(`.piece[data-index='${pieceIdx}']`);
    handleDrop(pieceEl, e.currentTarget);
}

function handleDrop(pieceEl, slot) {
    const existingPiece = slot.firstChild;
    if (existingPiece && existingPiece !== pieceEl) {
        document.getElementById('table').appendChild(existingPiece);
        existingPiece.dataset.placed = 'false';
    }

    const previousSlot = pieceEl.parentElement;
    if (previousSlot && previousSlot.classList.contains('slot')) {
        previousSlot.dataset.occupied = 'false';
        previousSlot.style.borderColor = '';
    }

    slot.appendChild(pieceEl);
    slot.dataset.occupied = 'true';
    pieceEl.draggable = true;
    pieceEl.style.cursor = 'grab';

    const pieceIndex = parseInt(pieceEl.dataset.index, 10);
    const slotIndex = parseInt(slot.dataset.index, 10);
    if (pieceIndex === slotIndex) {
        slot.style.borderColor = '#2b9';
    } else {
        slot.style.borderColor = '#d55';
    }

    verifyBoardComplete();
}


function verifyBoardComplete() {
    const slots = document.querySelectorAll('.slot');
    let allPlaced=true, allCorrect=true;
    slots.forEach(s=> {
        if(s.dataset.occupied!=='true') allPlaced=false;
        const child = s.firstChild;
        if(!child || parseInt(child.dataset.index, 10) !== parseInt(s.dataset.index, 10)) allCorrect=false;
    });

    if (allPlaced) document.getElementById('status-text').textContent='wszytskie elementy umieszczone';
    if (allPlaced && allCorrect) {
        document.getElementById('status-text').textContent='ułożone poprawnie!';
        console.log('Puzzle zostały ułożone poprawnie!');
        sendSuccessNotification();
    }
}