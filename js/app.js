// CONSTANTES DEL VASO
const EMPTY_Y = 350; // Fondo del vaso
const FULL_Y = 100;  // Tope del vaso
const RANGE = EMPTY_Y - FULL_Y;

let currentPercent = 0; // 0 a 1 (Nivel de llenado)
let time = 0; // Tiempo para la animación continua de olas

// ELEMENTOS SVG
const wavePathFront = document.getElementById('wave-path-front');
const wavePathBack = document.getElementById('wave-path-back');
const iceGroup = document.getElementById('ice-group');
const slider = document.getElementById('manual-slider');

// Función que calcula la forma de la ola
// phaseOffset: mueve la ola horizontalmente
// amplitude: altura de la ola
function createWavePath(baseY, phaseOffset, amplitude) {
    let d = `M 0 400 L 0 ${baseY}`; // Empieza en la esquina inferior izquierda y sube al nivel del agua
    
    // Dibujar la curva de la ola de izquierda a derecha (ancho 400)
    for (let x = 0; x <= 400; x += 10) {
        // Fórmula de onda senoidal
        const y = baseY + Math.sin((x / 60) + time + phaseOffset) * amplitude;
        d += ` L ${x} ${y}`;
    }
    
    d += ` L 400 400 Z`; // Cierra la forma hasta la esquina inferior derecha
    return d;
}

// Bucle de Animación Continua (60 FPS)
function animateWaves() {
    time += 0.05; // Velocidad del líquido

    // Calcular el nivel base del líquido actual (basado en scroll/slider)
    const currentY = EMPTY_Y - (RANGE * currentPercent);

    // 1. DIBUJAR OLA TRASERA (Más rápida, diferente fase y color más oscuro)
    const pathBack = createWavePath(currentY, Math.PI, 8); 
    wavePathBack.setAttribute('d', pathBack);

    // 2. DIBUJAR OLA FRONTAL
    const pathFront = createWavePath(currentY, 0, 12);
    wavePathFront.setAttribute('d', pathFront);

    // 3. MOVER HIELOS
    // Hacemos que los hielos también floten sutilmente con el tiempo (Math.sin)
    let iceY = currentY - 25 + Math.sin(time * 2) * 5; 
    if (iceY > 320) iceY = 320; // Límite de fondo
    iceGroup.setAttribute('transform', `translate(0, ${iceY})`);
    
    // Ocultar hielos si está muy vacío
    iceGroup.style.opacity = currentPercent < 0.05 ? '0' : '1';

    // Volver a llamar a la función en el próximo frame
    requestAnimationFrame(animateWaves);
}

// ACTUALIZAR NIVEL DE LLENADO (SCROLL O SLIDER)
function updateFill(percent) {
    currentPercent = Math.max(0, Math.min(1, percent));
    slider.value = currentPercent * 100;
}

// 1. ESCUCHAR SCROLL
window.addEventListener('scroll', () => {
    const hint = document.querySelector('.scroll-msg');
    if(window.scrollY > 50 && hint) hint.style.opacity = '0';
    else if(hint) hint.style.opacity = '1';

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return; 

    const percent = scrollTop / maxScroll;
    updateFill(percent);
});

// 2. ESCUCHAR SLIDER
slider.addEventListener('input', (e) => {
    const percent = e.target.value / 100;
    updateFill(percent);
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    window.scrollTo({ top: percent * maxScroll, behavior: 'auto' });
});

// FUNCIÓN DE DESCARGA
function downloadPNG() {
    const svg = document.getElementById('main-svg');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const svgData = new XMLSerializer().serializeToString(svg);
    const encodedData = encodeURIComponent(svgData);
    const img = new Image();

    img.onload = function() {
        canvas.width = 1200; canvas.height = 1200;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const link = document.createElement('a');
        link.download = "Punto33_Liquid_Engine.png";
        link.href = canvas.toDataURL('image/png');
        link.click();
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodedData;
}

// INICIAR EL MOTOR
updateFill(0);
animateWaves(); // Arrancar el bucle de olas perpetuas