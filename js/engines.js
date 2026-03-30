// Configuración General
const EMPTY_Y = 350; // Y en el fondo del vaso
const FULL_Y = 120;  // Y en el tope del vaso

let activeEngine = null; // Guardará qué motor (1, 2 o 3) está activo
let currentScrollPercent = 0; // 0 (vacío) a 1 (lleno)

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

// Función para activar un motor específico
function activateEngine(num) {
    activeEngine = num;
    
    // Resetear visualmente todos los vasos
    document.querySelectorAll('.glass-wrapper').forEach(wrapper => {
        wrapper.style.borderColor = '#334155'; // Borde apagado
        wrapper.style.boxShadow = 'none';
        wrapper.querySelector('.btn-export').style.display = 'none'; // Ocultar exportar
        wrapper.querySelector('.btn-activate').textContent = 'Seleccionar'; // Resetear botón
    });

    // Resaltar el vaso activo
    const activeWrapper = document.getElementById(\`wrapper-\${num}\`);
    activeWrapper.style.borderColor = '#10b981'; // Borde verde
    activeWrapper.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.3)';
    activeWrapper.querySelector('.btn-export').style.display = 'block'; // Mostrar exportar
    activeWrapper.querySelector('.btn-activate').textContent = '¡ACTIVO!';

    // Mostrar el hint de scroll
    scrollHint.style.opacity = '1';
    scrollHint.style.display = 'flex';

    // Hacer scroll arriba de todo para empezar "limpios"
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Forzar el render inicial en estado vacío (0)
    currentScrollPercent = 0;
    renderActiveEngine();
}

window.addEventListener('scroll', () => {
    if (!activeEngine) return; // Si no hay motor seleccionado, no hacer nada

    // Ocultar hint de scroll suavemente
    if (window.scrollY > 50) scrollHint.style.opacity = '0';
    else scrollHint.style.opacity = '1';

    // 1. Calcular porcentaje de scroll de la página (0.0 a 1.0)
    const scrollTop = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    
    if (maxScroll <= 0) return; // Prevención de errores si la página es muy corta

    currentScrollPercent = Math.max(0, Math.min(1, scrollTop / maxScroll));
    
    // Actualizar visualmente el motor activo
    renderActiveEngine();
});

function renderActiveEngine() {
    // 2. Calcular la posición Y del líquido (desde 350 hasta 120)
    const currentY = EMPTY_Y - ((EMPTY_Y - FULL_Y) * currentScrollPercent);
    const currentHeight = EMPTY_Y - currentY;

    if (activeEngine === 1) {
        // --- APLICAR A MOTOR 1: Mask Rect ---
        m1Rect.setAttribute('y', currentY);
        m1Rect.setAttribute('height', currentHeight > 0 ? currentHeight : 0);
        let iceY1 = currentY - 20; if(iceY1 > 300) iceY1 = 300;
        m1Ice.setAttribute('transform', \`translate(0, \${iceY1})\`);
        m1Ice.style.opacity = currentScrollPercent < 0.05 ? '0' : '1';
    } 
    else if (activeEngine === 2) {
        // --- APLICAR A MOTOR 2: Group Translate ---
        m2Group.setAttribute('transform', \`translate(0, \${currentY})\`);
    }
    else if (activeEngine === 3) {
        // --- APLICAR A MOTOR 3: Path Dinámico ---
        const wFront = \`M 0 \${currentY} Q 100 \${currentY-20} 200 \${currentY} T 400 \${currentY} L 400 400 L 0 400 Z\`;
        const wBack = \`M 0 \${currentY} Q 100 \${currentY+20} 200 \${currentY} T 400 \${currentY} L 400 400 L 0 400 Z\`;
        m3WaveFront.setAttribute('d', wFront);
        m3WaveBack.setAttribute('d', wBack);
        let iceY3 = currentY - 20; if(iceY3 > 300) iceY3 = 300;
        m3Ice.setAttribute('transform', \`translate(0, \${iceY3})\`);
        m3Ice.style.opacity = currentScrollPercent < 0.05 ? '0' : '1';
    }
}

// Función robusta de descarga SVG -> PNG
function downloadEngine(num) {
    if (activeEngine !== num) {
        alert("Por favor, selecciona primero este vaso y llénalo usando el scroll.");
        return;
    }

    const svgEl = document.getElementById(\`svg-engine-\${num}\`);
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // Forzamos un renderizado estático del SVG actual pausando animaciones 
    document.querySelectorAll('animate, animateTransform').forEach(anim => {
        if(anim.ownerSVGElement) anim.ownerSVGElement.pauseAnimations();
    });

    const svgData = new XMLSerializer().serializeToString(svgEl);
    
    // Método 100% seguro para base64 en navegadores móviles y desktop
    const base64Data = btoa(unescape(encodeURIComponent(svgData))); 
    const imgSrc = \`data:image/svg+xml;base64,\${base64Data}\`;
    
    const img = new Image();
    
    img.onload = function() {
        canvas.width = 1600; // 4K resolution
        canvas.height = 1600;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar SVG en el canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Descargar PNG
        const link = document.createElement('a');
        link.download = \`Punto33_Trago_Motor\${num}.png\`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Despausar animaciones
        document.querySelectorAll('animate, animateTransform').forEach(anim => {
            if(anim.ownerSVGElement) anim.ownerSVGElement.unpauseAnimations();
        });
    };

    img.onerror = function() {
        alert("Hubo un error al generar la imagen. Tu navegador podría estar bloqueando el renderizado de SVGs complejos.");
    };

    img.src = imgSrc;
}
