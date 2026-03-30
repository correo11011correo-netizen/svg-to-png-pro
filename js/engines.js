// Configuración General
const EMPTY_Y = 350; // Y en el fondo del vaso
const FULL_Y = 120;  // Y en el tope del vaso

// Elementos de los Motores
// MOTOR 1
const m1Rect = document.getElementById('m1-rect');
const m1Ice = document.getElementById('m1-ice');

// MOTOR 2
const m2Group = document.getElementById('m2-group');

// MOTOR 3
const m3WaveFront = document.getElementById('m3-wave-front');
const m3WaveBack = document.getElementById('m3-wave-back');
const m3Ice = document.getElementById('m3-ice');

const scrollHint = document.getElementById('scroll-hint');

window.addEventListener('scroll', () => {
    // Ocultar hint de scroll
    if (window.scrollY > 50) scrollHint.style.opacity = '0';
    else scrollHint.style.opacity = '1';

    // 1. Calcular porcentaje de scroll de la página (0.0 a 1.0)
    const scrollTop = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = Math.max(0, Math.min(1, scrollTop / maxScroll));

    // 2. Calcular la posición Y del líquido (desde 350 hasta 120)
    const currentY = EMPTY_Y - ((EMPTY_Y - FULL_Y) * scrollPercent);
    const currentHeight = EMPTY_Y - currentY;

    // --- APLICAR A MOTOR 1: Mask Rect ---
    // Cambia el tamaño del rectangulo de revelado
    m1Rect.setAttribute('y', currentY);
    m1Rect.setAttribute('height', currentHeight > 0 ? currentHeight : 0);
    // Los hielos en M1 suben con el currentY
    let iceY1 = currentY - 20; if(iceY1 > 300) iceY1 = 300;
    m1Ice.setAttribute('transform', \`translate(0, \${iceY1})\`);
    m1Ice.style.opacity = scrollPercent < 0.05 ? '0' : '1';

    // --- APLICAR A MOTOR 2: Group Translate ---
    // Traslada todo el grupo.
    m2Group.setAttribute('transform', \`translate(0, \${currentY})\`);

    // --- APLICAR A MOTOR 3: Path Dinámico (El más robusto) ---
    // Reescribimos los paths de las olas. Como no podemos animar X fácilmente en este motor simple, 
    // hacemos olas planas o dependientes solo de Y.
    // D(m) = M 0 Y Q 100 (Y-20) 200 Y T 400 Y ...
    const wFront = \`M 0 \${currentY} Q 100 \${currentY-20} 200 \${currentY} T 400 \${currentY} L 400 400 L 0 400 Z\`;
    const wBack = \`M 0 \${currentY} Q 100 \${currentY+20} 200 \${currentY} T 400 \${currentY} L 400 400 L 0 400 Z\`;
    m3WaveFront.setAttribute('d', wFront);
    m3WaveBack.setAttribute('d', wBack);
    // Hielos
    let iceY3 = currentY - 20; if(iceY3 > 300) iceY3 = 300;
    m3Ice.setAttribute('transform', \`translate(0, \${iceY3})\`);
    m3Ice.style.opacity = scrollPercent < 0.05 ? '0' : '1';
});

// Función robusta de descarga para probar si exportan bien
function downloadEngine(num) {
    const svgEl = document.getElementById(\`svg-engine-\${num}\`);
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // Pausar animaciones
    document.querySelectorAll('animate, animateTransform').forEach(anim => {
        if(anim.ownerSVGElement) anim.ownerSVGElement.pauseAnimations();
    });

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const encodedData = encodeURIComponent(svgData);
    const img = new Image();
    
    img.onload = function() {
        canvas.width = 800; canvas.height = 800;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const link = document.createElement('a');
        link.download = \`Punto33_Motor_\${num}_Test.png\`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        document.querySelectorAll('animate, animateTransform').forEach(anim => {
            if(anim.ownerSVGElement) anim.ownerSVGElement.unpauseAnimations();
        });
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodedData;
}
