// =============================================
// LUCIONE & ASOCIADOS - SCRIPT COMPLETO
// =============================================

// Configuración
const CONFIG = {
    splashDuration: 3000,
    transitionDuration: 1600,
    calendlyUrl: 'https://calendly.com/lucioneyasociados'
};

// Configuración WEB3FORMS
const WEB3FORMS_CONFIG = {
    accessKey: 'cd2ed93c-93a4-4f47-aae9-0f555317949b',
    // IMPORTANTE: Cambiar esto por tu dominio real antes de subir a producción
    successUrl: 'http://127.0.0.1:5500/gracias.html',
    successMessage: '¡Consulta enviada! La Dra. Lucione se contactará pronto.'
};

// Variables globales
let splashScreen, splashImage, mainContent, heroImage, headerLogo;
let calendlyInitialized = false;

// =============================================
// INICIALIZACIÓN PRINCIPAL (MANTENER ESTO)
// =============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Lucione & Asociados - Iniciando...');

    // Referencias a elementos
    splashScreen = document.getElementById('splash-screen');
    splashImage = document.getElementById('splash-image');
    mainContent = document.getElementById('main-content');
    heroImage = document.getElementById('hero-image');
    headerLogo = document.getElementById('header-logo');

    // Validar elementos
    if (!splashScreen || !mainContent) {
        console.error('❌ Elementos no encontrados');
        mostrarContenidoPrincipal();
        return;
    }

    // Configurar año actual
    actualizarAnoActual();

    // Inicializar funcionalidades básicas que no dependen de animación
    initMobileMenu();
    initSmoothScroll();
    initContactForm(); // ¡Solo una vez!
    initCalendlyCheck();

    // Iniciar animación después de 3 segundos
    setTimeout(iniciarAnimacionEntrada, CONFIG.splashDuration);
});

// =============================================
// FORMULARIO CON SISTEMA DE FALLBACK AUTOMÁTICO
// =============================================
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) {
        console.warn('⚠️ Formulario de contacto no encontrado');
        return;
    }
    
    console.log('🔄 Inicializando sistema de formulario...');
    
    // Elementos del DOM
    const formStatus = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');
    const originalBtnText = submitBtn.innerHTML;
    
    // Configuraciones
    const SERVICES = {
        WEB3FORMS: {
            url: 'https://api.web3forms.com/submit',
            accessKey: 'cd2ed93c-93a4-4f47-aae9-0f555317949b'
        },
        FORM_SUBMIT: {
            url: 'https://formsubmit.co/ajax/lucioneyasociados@gmail.com',
            backup: true
        }
    };
    
    // Función para mostrar mensajes
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
        
        // Auto-ocultar mensajes informativos después de 5 segundos
        if (type !== 'success') {
            setTimeout(() => {
                formStatus.style.display = 'none';
            }, 5000);
        }
    }
    
    // Función para estado de carga
    function setLoading(isLoading) {
        if (!submitBtn) return;
        
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    }
    
    // Función para enviar a Web3Forms (PRIMER INTENTO)
    async function sendToWeb3Forms(formData) {
        console.log('🔵 Intentando Web3Forms...');
        
        const payload = new FormData();
        
        // Añadir campos obligatorios de Web3Forms
        payload.append('access_key', SERVICES.WEB3FORMS.accessKey);
        payload.append('subject', 'Nueva Consulta - Lucione & Asociados');
        
        // Añadir campos del formulario
        const fields = ['name', 'email', 'phone', 'service', 'message', 'privacy'];
        fields.forEach(field => {
            const value = formData.get(field);
            if (value) {
                payload.append(field, value);
            }
        });
        
        // Opciones adicionales
        payload.append('from_name', 'Sitio Web Lucione & Asociados');
        
        console.log('📤 Enviando a Web3Forms...', {
            access_key: SERVICES.WEB3FORMS.accessKey.substring(0, 10) + '...',
            fields: Array.from(payload.keys())
        });
        
        const response = await fetch(SERVICES.WEB3FORMS.url, {
            method: 'POST',
            body: payload
        });
        
        return await response.json();
    }
    
    // Función para enviar a FormSubmit (SEGUNDO INTENTO)
    async function sendToFormSubmit(formData) {
        console.log('🟡 Intentando FormSubmit.co...');
        
        const payload = new FormData();
        
        // Configuración de FormSubmit
        payload.append('_subject', 'Nueva Consulta - Lucione & Asociados');
        payload.append('_template', 'table');
        payload.append('_captcha', 'false');
        payload.append('_cc', 'lucioneyasociados@gmail.com');
        
        // Mapear campos (FormSubmit usa nombres diferentes)
        const fieldMap = {
            'name': 'nombre',
            'email': 'email',
            'phone': 'telefono',
            'service': 'tipo_consulta',
            'message': 'mensaje',
            'privacy': 'acepto_privacidad'
        };
        
        Object.entries(fieldMap).forEach(([original, mapped]) => {
            const value = formData.get(original);
            if (value) {
                payload.append(mapped, value);
            }
        });
        
        const response = await fetch(SERVICES.FORM_SUBMIT.url, {
            method: 'POST',
            body: payload
        });
        
        return await response.json();
    }
    
    // Event listener principal
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        console.log('🚀 Iniciando envío de formulario...');
        setLoading(true);
        showStatus('Procesando su consulta...', 'info');
        
        try {
            // Obtener datos del formulario
            const formData = new FormData(this);
            
            // Validación básica
            const email = formData.get('email');
            const name = formData.get('name');
            
            if (!email || !name) {
                throw new Error('Por favor, complete los campos requeridos');
            }
            
            // INTENTO 1: Web3Forms
            let result = await sendToWeb3Forms(formData);
            
            // Si Web3Forms falla, intentar FormSubmit
            if (!result.success && SERVICES.FORM_SUBMIT.backup) {
                console.log('⚠️ Web3Forms falló, intentando FormSubmit...');
                showStatus('Usando servicio alternativo...', 'warning');
                
                result = await sendToFormSubmit(formData);
                
                // FormSubmit tiene diferente formato de respuesta
                if (result.success || result.message === 'success') {
                    result.success = true;
                }
            }
            
            // Manejar resultado final
            if (result.success) {
                console.log('✅ Formulario enviado exitosamente');
                showStatus('✅ ¡Consulta enviada! La Dra. Lucione se contactará pronto.', 'success');
                
                // Limpiar formulario después de 2 segundos
                setTimeout(() => {
                    contactForm.reset();
                    if (formStatus) formStatus.style.display = 'none';
                }, 2000);
                
            } else {
                // Ambos servicios fallaron
                throw new Error(result.message || 'No se pudo enviar el formulario');
            }
            
        } catch (error) {
            console.error('❌ Error crítico:', error);
            
            // Mensajes de error amigables
            let userMessage = 'Error al enviar. ';
            
            if (error.message.includes('Network') || !navigator.onLine) {
                userMessage = 'Sin conexión a internet. ';
            } else if (error.message.includes('Failed to fetch')) {
                userMessage = 'Error de conexión con el servidor. ';
            } else if (error.message.includes('campos requeridos')) {
                userMessage = error.message;
            } else {
                userMessage += error.message;
            }
            
            userMessage += 'Por favor, contáctenos por teléfono: +54 11 4321-5678';
            
            showStatus(`❌ ${userMessage}`, 'error');
            
        } finally {
            setLoading(false);
        }
    });
    
    // Validación en tiempo real para mejor UX
    const requiredFields = contactForm.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('input', function() {
            if (this.checkValidity()) {
                this.style.borderColor = '#38a169';
            } else {
                this.style.borderColor = '#cbd5e0';
            }
        });
        
        field.addEventListener('blur', function() {
            if (!this.value.trim() && this.hasAttribute('required')) {
                this.style.borderColor = '#e53e3e';
            }
        });
    });
    
    console.log('✅ Sistema de formulario inicializado');
}

// =============================================
// ANIMACIÓN DE ENTRADA (MANTENER TODO ESTO)
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

    // Crear clones
    const imageClone = crearCloneImagen();
    const logoClone = crearCloneLogo();

    // Animar
    setTimeout(() => {
        // Mover imagen al hero
        imageClone.style.top = heroPos.y + 'px';
        imageClone.style.left = heroPos.x + 'px';
        imageClone.style.width = heroPos.width + 'px';
        imageClone.style.height = heroPos.height + 'px';
        imageClone.style.borderRadius = '15px';
        imageClone.style.opacity = '0.7';

        // Mover logo al header
        logoClone.style.top = headerPos.y + 'px';
        logoClone.style.left = headerPos.x + 'px';
        logoClone.style.width = '200px';
        logoClone.style.opacity = '0.5';
        logoClone.style.transform = 'scale(0.3)';

        // Ocultar splash
        splashScreen.style.opacity = '0';

    }, 100);

    // Mostrar contenido
    setTimeout(() => {
        // Limpiar clones
        if (imageClone.parentNode) imageClone.parentNode.removeChild(imageClone);
        if (logoClone.parentNode) logoClone.parentNode.removeChild(logoClone);

        mostrarContenidoPrincipal();
        inicializarFuncionalidadesAvanzadas();

    }, CONFIG.transitionDuration);
}

// =============================================
// FUNCIONES DE UTILIDAD - ANIMACIÓN (MANTENER)
// =============================================
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
    clone.style.top = rect.top + 'px';
    clone.style.left = rect.left + 'px';
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
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
    clone.style.top = rect.top + (rect.height / 2 - 100) + 'px';
    clone.style.left = rect.left + 'px';
    clone.style.width = rect.width + 'px';
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
// FUNCIONALIDADES BÁSICAS (MANTENER)
// =============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                closeMobileMenu();
            }
        });
    });
    console.log('✅ Scroll suave configurado');
}

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
        link.addEventListener('click', closeMobileMenu);
    });

    console.log('✅ Menú móvil configurado');
}

function closeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger) hamburger.classList.remove('active');
    if (navMenu) navMenu.classList.remove('active');
}

// =============================================
// FUNCIONALIDADES AVANZADAS (MANTENER)
// =============================================
function inicializarFuncionalidadesAvanzadas() {
    console.log('⚙️ Inicializando funcionalidades avanzadas...');

    initIntersectionObserver();
    initParallaxEffect();
    initCalendlyObserver();
    initSimpleCoin(); // ← CAMBIADO A SIMPLE COIN

    console.log('✅ Funcionalidades avanzadas inicializadas');
}

// Observador de intersección para animaciones al scroll
function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Animaciones específicas
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

    // Observar elementos
    const elementosObservables = document.querySelectorAll(
        '.section, .valor-card, .proceso-step, .abogada-card'
    );

    elementosObservables.forEach(el => {
        observer.observe(el);
    });

    console.log(`✅ Observador de intersección configurado para ${elementosObservables.length} elementos`);
}

// Efecto parallax para la imagen del hero
function initParallaxEffect() {
    window.addEventListener('scroll', () => {
        if (heroImage) {
            const scrolled = window.pageYOffset;
            if (scrolled < 500) {
                const rate = scrolled * -0.3;
                heroImage.style.transform = `translateY(${rate}px)`;
            }
        }
    });
    console.log('✅ Efecto parallax configurado');
}

// =============================================
// CALENDLY (MANTENER)
// =============================================
function initCalendlyCheck() {
    setTimeout(() => {
        const calendlyIframe = document.querySelector('.calendly-inline-widget iframe');
        if (calendlyIframe) {
            console.log('✅ Calendly cargado correctamente');
            calendlyInitialized = true;
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
                <a href="${CONFIG.calendlyUrl}" 
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
            if (entry.isIntersecting && !calendlyInitialized) {
                console.log('📅 Calendly ahora es visible en pantalla');
            }
        });
    }, { threshold: 0.1 });

    observer.observe(calendlyWidget);
}

// =============================================
// FUNCIONES AUXILIARES (MANTENER)
// =============================================
function actualizarAnoActual() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    console.log('✅ Año actual actualizado');
}

// =============================================
// EVENTOS GLOBALES (MANTENER)
// =============================================
window.addEventListener('load', function () {
    console.log('🎉 Página completamente cargada');
    document.documentElement.classList.add('loaded');
});

// Manejo de errores
window.addEventListener('error', function (e) {
    console.error('❌ Error detectado:', e.error);
});

// Manejar redimensionamiento
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        console.log('🔄 Ventana redimensionada');
    }, 250);
});

// =============================================
// MONEDA GIRATORIA SIMPLIFICADA
// =============================================

// Datos de las especialidades (versión simplificada)
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
            <p>Defensa de derechos en salud mediante recursos de amparo:</p>
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

// Variables para la moneda simplificada
let currentEspecialidad = 0;
let autoRotateInterval;

// Inicializar moneda simplificada
function initSimpleCoin() {
    const coin = document.getElementById('simpleCoin');
    const modal = document.getElementById('especialidadModal');
    const modalClose = document.getElementById('modalClose');

    if (!coin) {
        console.warn('⚠️ Moneda no encontrada');
        return;
    }

    console.log('✅ Inicializando moneda giratoria simplificada');

    // Actualizar indicador
    function updateIndicator() {
        const currentSpan = document.querySelector('.simple-current');
        if (currentSpan) currentSpan.textContent = currentEspecialidad + 1;
    }

    // Actualizar total
    function updateTotal() {
        const totalSpan = document.querySelector('.simple-total');
        if (totalSpan) totalSpan.textContent = ESPECIALIDADES.length;
    }

    // Cambiar especialidad con animación
    function changeEspecialidad() {
        // Aplicar animación de cambio
        coin.classList.add('changing');

        // Cambiar contenido después de la mitad de la animación
        setTimeout(() => {
            const especialidad = ESPECIALIDADES[currentEspecialidad];

            // Actualizar contenido de la moneda
            coin.innerHTML = `
                <div class="coin-simple-front">
                    <i class="${especialidad.icon}"></i>
                    <span>${especialidad.title}</span>
                </div>
            `;

            coin.classList.remove('changing');
        }, 600);
    }

    // Avanzar a siguiente especialidad
    function nextEspecialidad() {
        currentEspecialidad = (currentEspecialidad + 1) % ESPECIALIDADES.length;
        updateIndicator();
        changeEspecialidad();
    }

    // Mostrar modal con la especialidad actual
    function showCurrentModal() {
        const especialidad = ESPECIALIDADES[currentEspecialidad];
        const modalIcon = document.getElementById('modalIcon');
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');

        if (modalIcon) modalIcon.className = `modal-icon ${especialidad.icon}`;
        if (modalTitle) modalTitle.textContent = especialidad.title;
        if (modalDescription) modalDescription.innerHTML = especialidad.description;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Pausar rotación automática mientras el modal está abierto
        clearInterval(autoRotateInterval);
    }

    // Cerrar modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';

        // Reanudar rotación automática después de 2 segundos
        setTimeout(() => {
            startAutoRotation();
        }, 2000);
    }

    // Iniciar rotación automática
    function startAutoRotation() {
        clearInterval(autoRotateInterval); // Limpiar cualquier intervalo anterior
        autoRotateInterval = setInterval(nextEspecialidad, 3000); // 3 segundos
    }

    // Event Listeners
    coin.addEventListener('click', showCurrentModal);

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // Cerrar modal con click fuera
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Cerrar modal con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Pausar rotación al hover
    coin.addEventListener('mouseenter', () => {
        clearInterval(autoRotateInterval);
    });

    coin.addEventListener('mouseleave', () => {
        if (!modal.classList.contains('active')) {
            startAutoRotation();
        }
    });

    // Inicializar estado
    updateIndicator();
    updateTotal();
    changeEspecialidad();

    // Iniciar rotación automática después de 2 segundos
    setTimeout(startAutoRotation, 2000);

    // Para debug
    console.log(`🎯 Moneda configurada con ${ESPECIALIDADES.length} especialidades`);
    console.log(`🔄 Rotación automática cada 3 segundos`);
}

console.log('✅ Script.js cargado completamente');