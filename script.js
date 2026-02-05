// =============================================
// LUCIONE & ASOCIADOS - SCRIPT OPTIMIZADO
// =============================================

// CONFIGURACIÓN GLOBAL
const CONFIG = {
    splash: {
        duration: 3000,
        transitionDuration: 1600
    },
    calendly: {
        url: 'https://calendly.com/lucioneyasociados',
        initialized: false
    },
    web3forms: {
        accessKey: 'cd2ed93c-93a4-4f47-aae9-0f555317949b',
        successUrl: 'gracias.html'
    },
    coin: {
        autoRotateDelay: 1500,
        animationDuration: 300,
        resumeAfterModal: 1000,
        initialDelay: 1000
    }
};

// VARIABLES GLOBALES
let splashScreen, splashImage, mainContent, heroImage, headerLogo;

// =============================================
// INICIALIZACIÓN PRINCIPAL
// =============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Lucione & Asociados - Iniciando...');

    splashScreen = document.getElementById('splash-screen');
    splashImage = document.getElementById('splash-image');
    mainContent = document.getElementById('main-content');
    heroImage = document.getElementById('hero-image');
    headerLogo = document.getElementById('header-logo');

    if (!splashScreen || !mainContent) {
        console.error('❌ Elementos críticos no encontrados');
        mostrarContenidoPrincipal();
        return;
    }

    actualizarAnoActual();
    initMobileMenu();
    initSmoothScroll();
    initContactForm();
    initCalendlyCheck();

    setTimeout(iniciarAnimacionEntrada, CONFIG.splash.duration);
});

// =============================================
// FORMULARIO DE CONTACTO
// =============================================
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) {
        console.warn('⚠️ Formulario de contacto no encontrado');
        return;
    }

    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        // Esto limpia la letra APENAS el usuario la escribe
        phoneInput.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }

    console.log('📧 Inicializando formulario Web3Forms...');

    const formStatus = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');
    const originalBtnText = submitBtn.innerHTML;

    function showStatus(message, type = 'info') {
        if (!formStatus) return;

        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };

        formStatus.innerHTML = `
            <div class="form-notification ${type}">
                <div class="notification-content">
                    <i class="fas fa-${icons[type] || 'info-circle'}"></i>
                    <span>${message}</span>
                </div>
            </div>
        `;
        formStatus.style.display = 'block';

        if (type !== 'success') {
            setTimeout(() => formStatus.style.display = 'none', 5000);
        }
    }

    function setLoading(isLoading) {
        if (!submitBtn) return;

        submitBtn.disabled = isLoading;
        submitBtn.innerHTML = isLoading
            ? '<i class="fas fa-spinner fa-spin"></i> Enviando...'
            : originalBtnText;
    }

    async function sendToWeb3Forms(formData) {
        console.log('📤 Enviando a Web3Forms...');

        const payload = new FormData();

        payload.append('access_key', CONFIG.web3forms.accessKey);
        payload.append('subject', 'Nueva Consulta - Lucione & Asociados');
        payload.append('from_name', 'Sitio Web Lucione & Asociados');

        const fields = ['name', 'email', 'phone', 'service', 'message', 'privacy'];
        fields.forEach(field => {
            const value = formData.get(field);
            if (value) payload.append(field, value);
        });

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: payload
            });

            return await response.json();
        } catch (error) {
            throw new Error('Error de conexión con el servidor');
        }
    }

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        console.log('🚀 Iniciando envío de formulario...');
        setLoading(true);
        showStatus('Procesando su consulta...', 'info');

        try {
            const formData = new FormData(this);

            const phoneValue = formData.get('phone');

            if (phoneValue && (/[^0-9]/.test(phoneValue) || phoneValue.length < 8)) {
                throw new Error('El teléfono debe contener solo números (mínimo 8 dígitos)');
            }

            const email = formData.get('email');
            const name = formData.get('name');

            if (!email || !name) {
                throw new Error('Por favor, complete los campos requeridos');
            }

            const result = await sendToWeb3Forms(formData);

            if (result.success) {
                console.log('✅ Formulario enviado exitosamente');
                showStatus('✅ ¡Consulta enviada! Redirigiendo...', 'success');
                contactForm.reset();

                setTimeout(() => {
                    window.location.href = CONFIG.web3forms.successUrl;
                }, 2000);

            } else {
                throw new Error(result.message || 'No se pudo enviar el formulario');
            }

        } catch (error) {
            console.error('❌ Error:', error);

            let userMessage = error.message;
            if (!navigator.onLine) {
                userMessage = 'Sin conexión a internet. ';
                // showStatus(`❌ ${userMessage}. O contáctenos al: +54 11 6489-6416`, 'error');
            } else if (error.message.includes('campos requeridos')) {
                userMessage = error.message;
            }

            userMessage += 'Por favor, contáctenos por teléfono: +54 11 6489-6416';
            showStatus(`❌ ${userMessage}`, 'error');

        } finally {
            setLoading(false);
        }
    });

    const requiredFields = contactForm.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('input', function () {
            this.style.borderColor = this.checkValidity() ? '#38a169' : '#cbd5e0';
        });

        field.addEventListener('blur', function () {
            if (!this.value.trim() && this.hasAttribute('required')) {
                this.style.borderColor = '#e53e3e';
            }
        });
    });

    console.log('✅ Formulario inicializado');
}

// =============================================
// ANIMACIÓN DE ENTRADA
// =============================================
function iniciarAnimacionEntrada() {
    console.log('🎬 Iniciando animación de entrada...');

    const heroPos = obtenerPosicionHeroImage();
    const headerPos = obtenerPosicionHeaderLogo();

    if (!heroPos || !headerPos) {
        console.warn('⚠️ Posiciones no obtenidas');
        mostrarContenidoPrincipal();
        return;
    }

    const imageClone = crearCloneImagen();
    const logoClone = crearCloneLogo();

    setTimeout(() => {
        imageClone.style.top = `${heroPos.y}px`;
        imageClone.style.left = `${heroPos.x}px`;
        imageClone.style.width = `${heroPos.width}px`;
        imageClone.style.height = `${heroPos.height}px`;
        imageClone.style.borderRadius = '15px';
        imageClone.style.opacity = '0.7';

        logoClone.style.top = `${headerPos.y}px`;
        logoClone.style.left = `${headerPos.x}px`;
        logoClone.style.width = '200px';
        logoClone.style.opacity = '0.5';
        logoClone.style.transform = 'scale(0.3)';

        splashScreen.style.opacity = '0';
    }, 100);

    setTimeout(() => {
        if (imageClone.parentNode) imageClone.parentNode.removeChild(imageClone);
        if (logoClone.parentNode) logoClone.parentNode.removeChild(logoClone);

        mostrarContenidoPrincipal();
        inicializarFuncionalidadesAvanzadas();
    }, CONFIG.splash.transitionDuration);
}

function obtenerPosicionHeroImage() {
    const heroImg = document.querySelector('.hero-main-image');
    if (!heroImg) return null;

    const rect = heroImg.getBoundingClientRect();
    return {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height
    };
}

function obtenerPosicionHeaderLogo() {
    const logoContainer = document.querySelector('.logo-container');
    if (!logoContainer) return null;

    const rect = logoContainer.getBoundingClientRect();
    return {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height
    };
}

function crearCloneImagen() {
    const clone = splashImage.cloneNode(true);
    clone.id = 'image-clone-transition';
    clone.classList.add('image-transition');

    const rect = splashImage.getBoundingClientRect();
    clone.style.position = 'fixed';
    clone.style.top = `${rect.top}px`;
    clone.style.left = `${rect.left}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.objectFit = 'cover';
    clone.style.zIndex = '9998';

    document.body.appendChild(clone);
    return clone;
}

function crearCloneLogo() {
    const logoContainer = document.querySelector('.logo-splash-container');
    const clone = logoContainer.cloneNode(true);
    clone.id = 'logo-clone-transition';
    clone.classList.add('image-transition');

    const rect = splashImage.getBoundingClientRect();
    clone.style.position = 'fixed';
    clone.style.top = `${rect.top + (rect.height / 2 - 100)}px`;
    clone.style.left = `${rect.left}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.textAlign = 'center';
    clone.style.zIndex = '9998';

    document.body.appendChild(clone);
    return clone;
}

function mostrarContenidoPrincipal() {
    splashScreen.style.display = 'none';
    mainContent.classList.remove('hidden');

    if (headerLogo) headerLogo.classList.add('visible');
    if (heroImage) heroImage.classList.add('loaded');

    document.body.classList.add('page-loaded');
    console.log('✅ Contenido principal mostrado');
}

// =============================================
// FUNCIONALIDADES BÁSICAS
// =============================================
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (!hamburger || !navMenu) {
        console.warn('⚠️ Elementos del menú móvil no encontrados');
        return;
    }

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    console.log('✅ Menú móvil configurado');
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    console.log('✅ Scroll suave configurado');
}

// =============================================
// FUNCIONALIDADES AVANZADAS
// =============================================
function inicializarFuncionalidadesAvanzadas() {
    console.log('⚙️ Inicializando funcionalidades avanzadas...');

    initIntersectionObserver();
    initParallaxEffect();
    initCalendlyObserver();
    initSimpleCoin();

    console.log('✅ Funcionalidades avanzadas inicializadas');
}

function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                if (entry.target.classList.contains('valor-card')) {
                    entry.target.style.animation = 'slideUp 0.6s ease forwards';
                }

                if (entry.target.classList.contains('proceso-step')) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateX(0)';
                    }, 100);
                }
            }
        });
    }, observerOptions);

    const elementosObservables = document.querySelectorAll(
        '.section, .valor-card, .proceso-step, .abogada-card'
    );

    elementosObservables.forEach(el => observer.observe(el));
    console.log(`✅ Observador configurado para ${elementosObservables.length} elementos`);
}

function initParallaxEffect() {
    if (!heroImage) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (scrolled < 500) {
            const rate = scrolled * -0.3;
            heroImage.style.transform = `translateY(${rate}px)`;
        }
    });

    console.log('✅ Efecto parallax configurado');
}

// =============================================
// CALENDLY BÁSICO
// =============================================
function initCalendlyCheck() {
    setTimeout(() => {
        const calendlyIframe = document.querySelector('.calendly-inline-widget iframe');
        if (calendlyIframe) {
            console.log('✅ Calendly cargado correctamente');
            CONFIG.calendly.initialized = true;
        } else {
            console.warn('⚠️ Calendly no se cargó automáticamente');
            setTimeout(checkCalendlyAgain, 2000);
        }
    }, 3000);
}

function checkCalendlyAgain() {
    const calendlyIframe = document.querySelector('.calendly-inline-widget iframe');
    if (!calendlyIframe) {
        console.log('🔄 Mostrando alternativa para Calendly');
        showCalendlyAlternative();
    }
}

function showCalendlyAlternative() {
    const calendlyWrapper = document.querySelector('.calendly-embed-wrapper');
    if (!calendlyWrapper) return;

    calendlyWrapper.innerHTML = `
        <div class="calendly-alternative">
            <div class="alternative-icon">
                <i class="fas fa-calendar-alt"></i>
            </div>
            <h4>Agendar Consulta</h4>
            <p>Para agendar una consulta con la Dra. Lucione:</p>
            <div class="alternative-buttons">
                <a href="${CONFIG.calendly.url}" 
                   target="_blank" 
                   class="btn btn-primary">
                    <i class="fas fa-external-link-alt"></i> Ir a Calendly
                </a>
                <p class="alternative-or">O</p>
                <a href="#contacto" class="btn btn-secondary">
                    <i class="fas fa-envelope"></i> Contactarnos
                </a>
            </div>
            <p class="alternative-note">
                <i class="fas fa-clock"></i> Primera consulta sin cargo (30 min)
            </p>
        </div>
    `;

    console.log('✅ Alternativa de Calendly mostrada');
}

function initCalendlyObserver() {
    const calendlyWidget = document.querySelector('.calendly-inline-widget');
    if (!calendlyWidget) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !CONFIG.calendly.initialized) {
                console.log('📅 Calendly visible en pantalla');
            }
        });
    }, { threshold: 0.1 });

    observer.observe(calendlyWidget);
}

// =============================================
// MONEDA GIRATORIA (MANTENER)
// =============================================
const ESPECIALIDADES = [
    {
        id: 0,
        icon: 'fas fa-balance-scale',
        title: 'Divorcios',
        description: `
            <p>Asesoramiento integral en procesos de divorcio, garantizando sus derechos:</p>
            <ul>
                <li>Divorcio express y contencioso</li>
                <li>Acuerdos prenupciales y convenios reguladores</li>
                <li>Cálculo y reclamo de alimentos</li>
                <li>Régimen de visitas y tenencia compartida</li>
                <li>División de bienes gananciales</li>
            </ul>
            <p>Protejamos sus derechos y los de su familia durante este proceso.</p>
        `
    },
    {
        id: 1,
        icon: 'fas fa-briefcase',
        title: 'Sucesiones',
        description: `
            <p>Tramitación completa de sucesiones, testamentos y declaratorias de herederos:</p>
            <ul>
                <li>Apertura de sucesiones intestadas y testamentarias</li>
                <li>Declaratoria de herederos</li>
                <li>Planificación sucesoria y testamentos</li>
                <li>Particiones y adjudicaciones de bienes</li>
                <li>Impuestos sucesorios y certificados de domicilio</li>
            </ul>
            <p>Simplificamos los trámites sucesorios con máxima eficiencia.</p>
        `
    },
    {
        id: 2,
        icon: 'fas fa-home',
        title: 'Amparos de Salud',
        description: `
            <p>Defensa de derechos en salud mediante acción de amparo:</p>
            <ul>
                <li>Reclamos a obras sociales y prepagas</li>
                <li>Cobertura de medicamentos y tratamientos</li>
                <li>Autorizaciones de prácticas médicas urgentes</li>
                <li>Reintegros de gastos médicos</li>
                <li>Defensa ante negativas de cobertura</li>
            </ul>
            <p>Garantizamos su derecho a la salud y acceso a tratamientos.</p>
        `
    },
    {
        id: 3,
        icon: 'fas fa-file-contract',
        title: 'Accidentes de Tránsito',
        description: `
            <p>Representación legal en casos de accidentes de tránsito:</p>
            <ul>
                <li>Reclamos por daños y perjuicios</li>
                <li>Lesiones personales e incapacidades</li>
                <li>Negociación con compañías de seguros</li>
                <li>Responsabilidad civil y penal</li>
                <li>Indemnizaciones por muerte o incapacidad</li>
            </ul>
            <p>Recuperamos lo que le corresponde por los daños sufridos.</p>
        `
    },
    {
        id: 4,
        icon: 'fas fa-briefcase',
        title: 'Reclamos Laborales',
        description: `
            <p>Defensa de derechos laborales y reclamos ante empleadores:</p>
            <ul>
                <li>Despidos injustificados e indemnizaciones</li>
                <li>Diferencias salariales y horas extras</li>
                <li>Accidentes de trabajo y enfermedades profesionales</li>
                <li>Discriminación y acoso laboral</li>
                <li>Negociación de acuerdos extrajudiciales</li>
            </ul>
            <p>Protegemos sus derechos como trabajador.</p>
        `
    }
];

let currentEspecialidad = 0;
let autoRotateInterval;

function initSimpleCoin() {
    const coin = document.getElementById('simpleCoin');
    const modal = document.getElementById('especialidadModal');
    const modalClose = document.getElementById('modalClose');
    const consultarBtn = document.getElementById('consultarBtn'); // Referencia única

    if (!coin) {
        console.warn('⚠️ Moneda no encontrada');
        return;
    }

    console.log('🎯 Inicializando moneda giratoria...');

    function changeEspecialidad() {
        coin.classList.add('changing');

        setTimeout(() => {
            const especialidad = ESPECIALIDADES[currentEspecialidad];
            coin.innerHTML = `
                <div class="coin-simple-front">
                    <i class="${especialidad.icon}"></i>
                    <span>${especialidad.title}</span>
                </div>
            `;
            coin.classList.remove('changing');
        }, CONFIG.coin.animationDuration);
    }

    function nextEspecialidad() {
        currentEspecialidad = (currentEspecialidad + 1) % ESPECIALIDADES.length;
        changeEspecialidad();
    }

    function prevEspecialidad() {
        currentEspecialidad = (currentEspecialidad - 1 + ESPECIALIDADES.length) % ESPECIALIDADES.length;
        changeEspecialidad();
    }

    function startAutoRotation() {
        clearInterval(autoRotateInterval);
        autoRotateInterval = setInterval(nextEspecialidad, CONFIG.coin.autoRotateDelay);
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleKeyNavigation);
        setTimeout(startAutoRotation, CONFIG.coin.resumeAfterModal);
    }

    function handleKeyNavigation(e) {
        if (e.key === 'ArrowRight') nextEspecialidad();
        if (e.key === 'ArrowLeft') prevEspecialidad();
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    }

    function showCurrentModal() {
        const especialidad = ESPECIALIDADES[currentEspecialidad];
        document.getElementById('simulador-cta')?.remove();

        const modalIcon = document.getElementById('modalIcon');
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');

        if (modalIcon) modalIcon.className = `modal-icon ${especialidad.icon}`;
        if (modalTitle) modalTitle.textContent = especialidad.title;
        if (modalDescription) modalDescription.innerHTML = especialidad.description;

        if (especialidad.id === 1) {
            const simContainer = document.createElement('div');
            simContainer.id = 'simulador-cta';
            simContainer.className = 'modal-cta cta-simulador';
            simContainer.innerHTML = `
                <p>¿Desea estimar la distribución de una herencia?</p>
                <a href="https://martinspalma.github.io/microServicioSucesiones/" 
                   target="_blank" 
                   class="btn btn-primary modal-contact-btn btn-simulador">
                    <i class="fas fa-calculator"></i> Simular sucesión
                </a>
            `;
            const standardCta = document.querySelector('.modal-cta:not(.cta-simulador)');
            if (standardCta) standardCta.parentNode.insertBefore(simContainer, standardCta);
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        clearInterval(autoRotateInterval);
        document.addEventListener('keydown', handleKeyNavigation);
    }

    // --- LISTENERS ---
    if (consultarBtn) {
        consultarBtn.addEventListener('click', function (e) {
            e.preventDefault();
            closeModal();
            setTimeout(() => {
                const contactoSection = document.querySelector('#contacto');
                if (contactoSection) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = contactoSection.offsetTop - headerHeight - 20;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                    const contactForm = document.querySelector('.contact-form');
                    if (contactForm) {
                        contactForm.style.boxShadow = '0 0 0 3px var(--accent-glow)';
                        setTimeout(() => contactForm.style.boxShadow = '', 2000);
                    }
                }
            }, 300);
        });
    }

    coin.addEventListener('click', showCurrentModal);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    coin.addEventListener('mouseenter', () => clearInterval(autoRotateInterval));
    coin.addEventListener('mouseleave', () => {
        if (!modal.classList.contains('active')) startAutoRotation();
    });

    changeEspecialidad();
    setTimeout(startAutoRotation, CONFIG.coin.initialDelay);

    console.log(`✅ Moneda configurada con ${ESPECIALIDADES.length} especialidades`);
}

// =============================================
// FUNCIONES AUXILIARES
// =============================================
function actualizarAnoActual() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    console.log('📅 Año actual actualizado');
}

// =============================================
// EVENTOS GLOBALES
// =============================================
window.addEventListener('load', function () {
    console.log('🎉 Página completamente cargada');
    document.documentElement.classList.add('loaded');
});

window.addEventListener('error', function (e) {
    console.error('❌ Error detectado:', e.error);
});

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        console.log('🔄 Ventana redimensionada');
    }, 250);
});


// =============================================
// VOLTEO AUTOMÁTICO DE FICHAS DE VALORES (JS)
// =============================================

document.addEventListener('DOMContentLoaded', function () {
    const valores = [
        { id: "confidencialidad", icono: "fas fa-user-shield", titulo: "Confidencialidad", descripcion: "Total discreción y protección de su información personal y legal." },
        { id: "personalizacion", icono: "fas fa-bullseye", titulo: "Enfoque Personalizado", descripcion: "Estrategias legales adaptadas a las necesidades específicas de cada cliente." },
        { id: "comunicacion", icono: "fas fa-comments", titulo: "Comunicación Clara", descripcion: "Explicamos cada paso del proceso legal en términos comprensibles." },
        { id: "disponibilidad", icono: "fas fa-clock", titulo: "Disponibilidad", descripcion: "Atención oportuna y seguimiento constante de su caso." }
    ];

    const pilaActiva = document.querySelector('.pila-activa');
    const pilaMostrada = document.querySelector('.pila-mostrada');
    const indicadoresActiva = document.querySelector('.indicadores-activa');
    const indicadoresMostrada = document.querySelector('.indicadores-mostrada');

    let indiceActual = 0;
    const intervaloCambio = 2500;
    let intervalo;
    let enTransicion = false;

    function crearIndicadores() {
        if (indicadoresActiva) indicadoresActiva.innerHTML = '';
        if (indicadoresMostrada) indicadoresMostrada.innerHTML = '';

        for (let i = 0; i < valores.length; i++) {
            const puntoActiva = document.createElement('div');
            puntoActiva.className = `punto-indicador ${i === 1 ? 'activo' : ''}`;
            if (indicadoresActiva) indicadoresActiva.appendChild(puntoActiva);

            const puntoMostrada = document.createElement('div');
            puntoMostrada.className = `punto-indicador ${i === 0 ? 'activo' : ''}`;
            if (indicadoresMostrada) indicadoresMostrada.appendChild(puntoMostrada);
        }
    }

    function actualizarTarjetas() {
        if (enTransicion) return;
        enTransicion = true;

        const siguienteIndice = (indiceActual + 1) % valores.length;
        const proximoIndice = (siguienteIndice + 1) % valores.length; // Para la pila de espera

        const tarjetaActiva = pilaActiva?.querySelector('.tarjeta-valor');
        const tarjetaMostrada = pilaMostrada?.querySelector('.tarjeta-valor');

        // Fase 1: Iniciar salida (CSS maneja el scale y blur)
        if (tarjetaActiva) {
            tarjetaActiva.classList.remove('visible');
            tarjetaActiva.classList.add('tarjeta-transfiriendo');
        }
        if (tarjetaMostrada) {
            tarjetaMostrada.classList.remove('visible');
        }

        // Fase 2: Actualizar contenido mientras están ocultas
        setTimeout(() => {
            if (tarjetaActiva) {
                tarjetaActiva.classList.remove('tarjeta-transfiriendo');
                actualizarContenidoTarjeta(pilaActiva, valores[proximoIndice]);
            }

            actualizarContenidoTarjeta(pilaMostrada, valores[siguienteIndice]);
            actualizarIndicadores();

            indiceActual = siguienteIndice;
            enTransicion = false;
        }, 600); // Coincide con la duración del CSS
    }

    function actualizarContenidoTarjeta(contenedor, valor) {
        if (!contenedor) return;
        const tarjeta = contenedor.querySelector('.tarjeta-valor');
        if (!tarjeta) return;

        // Cambiamos el ID para que el CSS aplique el nuevo color inmediatamente
        tarjeta.setAttribute('data-valor', valor.id);
        tarjeta.querySelector('.icono-tarjeta').innerHTML = `<i class="${valor.icono}"></i>`;
        tarjeta.querySelector('h4').textContent = valor.titulo;
        tarjeta.querySelector('p').textContent = valor.descripcion;

        // El navegador aplica la transición de entrada al añadir 'visible'
        requestAnimationFrame(() => {
            tarjeta.classList.add('visible');
        });
    }

    function actualizarIndicadores() {
        const puntosActiva = document.querySelectorAll('.indicadores-activa .punto-indicador');
        const puntosMostrada = document.querySelectorAll('.indicadores-mostrada .punto-indicador');

        const indiceActiva = (indiceActual + 1) % valores.length;

        puntosActiva.forEach((punto, i) => punto.classList.toggle('activo', i === indiceActiva));
        puntosMostrada.forEach((punto, i) => punto.classList.toggle('activo', i === indiceActual));
    }

    function iniciarCiclo() {
        clearInterval(intervalo);
        intervalo = setInterval(actualizarTarjetas, intervaloCambio);
    }

    function inicializar() {
        crearIndicadores();
        actualizarContenidoTarjeta(pilaMostrada, valores[0]);
        actualizarContenidoTarjeta(pilaActiva, valores[1]);
        iniciarCiclo();
    }

    // Intersection Observer para no consumir recursos si no se ve
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!intervalo) iniciarCiclo();
            } else {
                clearInterval(intervalo);
                intervalo = null;
            }
        });
    }, { threshold: 0.3 });

    inicializar();
    const valoresSection = document.querySelector('.valores-section');
    if (valoresSection) observer.observe(valoresSection);
});


console.log('✅ Script.js cargado completamente');