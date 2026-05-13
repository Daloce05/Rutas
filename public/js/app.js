// =================================
// CONFIGURACIÓN Y CONSTANTES
// =================================
const API_URL = 'http://localhost:3000/api';

let viajeActual = null;
let tiposGastos = [];
let gastosInicialesTempId = 0;
let appInicializado = false;

// =================================
// INICIALIZACIÓN
// =================================
document.addEventListener('DOMContentLoaded', () => {
    inicializarLogin();
});

// =================================
// LOGIN
// =================================
function inicializarLogin() {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    if (!loginForm) return;

    const sessionUser = localStorage.getItem('sessionUser');
    if (sessionUser === 'admin') {
        mostrarApp();
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        loginError.style.display = 'none';

        const username = document.getElementById('loginUser').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                loginError.style.display = 'block';
                return;
            }

            const data = await response.json();
            if (data.success) {
                localStorage.setItem('sessionUser', 'admin');
                mostrarApp();
            } else {
                loginError.style.display = 'block';
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            loginError.style.display = 'block';
        }
    });
}

function mostrarApp() {
    const loginSection = document.getElementById('loginSection');
    const appContent = document.getElementById('appContent');

    if (loginSection) loginSection.style.display = 'none';
    if (appContent) appContent.style.display = 'block';

    inicializarApp();
    inicializarLogout();

}

function inicializarLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('sessionUser');
            location.reload();
        });
    }
}

function inicializarApp() {
    if (appInicializado) return;
    appInicializado = true;

    inicializarTabs();
    cargarViajes();
    cargarTiposGastos();
    configurarFormularios();
}

// =================================
// TABS
// =================================
function inicializarTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Actualizar botones
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Actualizar contenido
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
            
            // Recargar datos según la tab
            if (tabId === 'viajes') {
                cargarViajes();
            } else if (tabId === 'tipos-gastos') {
                cargarTiposGastos();
            }
        });
    });
}

// =================================
// VIAJES
// =================================
async function cargarViajes() {
    try {
        const response = await fetch(`${API_URL}/viajes`);
        const data = await response.json();
        
        if (data.success) {
            mostrarViajes(data.data);
        }
    } catch (error) {
        console.error('Error al cargar viajes:', error);
        mostrarError('Error al cargar los viajes');
    }
}

function mostrarViajes(viajes) {
    const tbody = document.getElementById('viajesBody');
    
    if (viajes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">No hay viajes registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = viajes.map(viaje => `
        <tr>
            <td>${formatearFecha(viaje.fecha_viaje)}</td>
            <td>${viaje.material_transportado}</td>
            <td>${viaje.origen} → ${viaje.destino}</td>
            <td>${viaje.placa_vehiculo}</td>
            <td>${formatearMoneda(viaje.valor_flete)}</td>
            <td>${formatearMoneda(viaje.total_gastos)}</td>
            <td class="${viaje.saldo_final >= 0 ? 'text-success' : 'text-danger'}">
                ${formatearMoneda(viaje.saldo_final)}
            </td>
            <td>
                <button class="btn btn-sm btn-icon btn-primary" onclick="verGastos(${viaje.id})" title="Gestionar Gastos">
                    💰
                </button>
                <button class="btn btn-sm btn-icon btn-secondary" onclick="editarViaje(${viaje.id})" title="Editar">
                    ✏️
                </button>
                <button class="btn btn-sm btn-icon btn-success" onclick="descargarPDF(${viaje.id})" title="Descargar PDF">
                    📄
                </button>
                <button class="btn btn-sm btn-icon btn-danger" onclick="eliminarViaje(${viaje.id})" title="Eliminar">
                    🗑️
                </button>
            </td>
        </tr>
    `).join('');
}

function filtrarViajes() {
    const searchTerm = document.getElementById('searchViajes').value.toLowerCase();
    const rows = document.querySelectorAll('#viajesBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function abrirModalViaje(viaje = null) {
    const modal = document.getElementById('modalViaje');
    const title = document.getElementById('modalViajeTitle');
    const form = document.getElementById('formViaje');
    
    form.reset();
    resetGastosIniciales();
    agregarGastoInicialFila();
    
    if (viaje) {
        title.textContent = 'Editar Viaje';
        document.getElementById('viajeId').value = viaje.id;
        document.getElementById('fecha_viaje').value = viaje.fecha_viaje.split('T')[0];
        document.getElementById('material_transportado').value = viaje.material_transportado;
        document.getElementById('origen').value = viaje.origen;
        document.getElementById('destino').value = viaje.destino;
        document.getElementById('kilos_transportados').value = viaje.kilos_transportados;
        document.getElementById('valor_flete').value = viaje.valor_flete;
        document.getElementById('placa_vehiculo').value = viaje.placa_vehiculo;
        document.getElementById('observaciones').value = viaje.observaciones || '';
    } else {
        title.textContent = 'Nuevo Viaje';
        document.getElementById('viajeId').value = '';
    }
    
    modal.style.display = 'block';
}

function cerrarModalViaje() {
    document.getElementById('modalViaje').style.display = 'none';
}

async function editarViaje(id) {
    try {
        const response = await fetch(`${API_URL}/viajes/${id}`);
        const data = await response.json();
        
        if (data.success) {
            abrirModalViaje(data.data);
        }
    } catch (error) {
        console.error('Error al cargar viaje:', error);
        mostrarError('Error al cargar el viaje');
    }
}

async function eliminarViaje(id) {
    if (!confirm('¿Está seguro de eliminar este viaje? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/viajes/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarExito('Viaje eliminado exitosamente');
            cargarViajes();
        } else {
            mostrarError(data.message);
        }
    } catch (error) {
        console.error('Error al eliminar viaje:', error);
        mostrarError('Error al eliminar el viaje');
    }
}

function descargarPDF(id) {
    window.open(`${API_URL}/viajes/${id}/pdf`, '_blank');
}

// =================================
// GASTOS
// =================================
async function verGastos(viajeId) {
    try {
        const response = await fetch(`${API_URL}/viajes/${viajeId}/completo`);
        const data = await response.json();
        
        if (data.success) {
            viajeActual = data.data;
            mostrarModalGastos();
        }
    } catch (error) {
        console.error('Error al cargar gastos:', error);
        mostrarError('Error al cargar los gastos');
    }
}

function mostrarModalGastos() {
    const modal = document.getElementById('modalGastos');
    const title = document.getElementById('modalGastosTitle');
    
    title.textContent = `Gastos del Viaje - ${viajeActual.origen} → ${viajeActual.destino}`;
    
    // Info del viaje
    const infoViaje = document.getElementById('infoViaje');
    infoViaje.innerHTML = `
        <p><strong>Fecha:</strong> ${formatearFecha(viajeActual.fecha_viaje)}</p>
        <p><strong>Material:</strong> ${viajeActual.material_transportado}</p>
        <p><strong>Placa:</strong> ${viajeActual.placa_vehiculo}</p>
        <p><strong>Valor Flete:</strong> ${formatearMoneda(viajeActual.valor_flete)}</p>
    `;
    
    // Cargar tipos de gastos en el select
    cargarSelectTiposGastos();
    
    // Mostrar gastos
    mostrarGastos(viajeActual.gastos);
    
    // Actualizar totales
    actualizarTotales();
    
    modal.style.display = 'block';
}

function cerrarModalGastos() {
    document.getElementById('modalGastos').style.display = 'none';
    document.getElementById('formGastoContainer').style.display = 'none';
    viajeActual = null;
    cargarViajes(); // Recargar viajes para actualizar totales
}

function mostrarGastos(gastos) {
    const tbody = document.getElementById('gastosBody');
    
    if (!gastos || gastos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading">No hay gastos registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = gastos.map(gasto => `
        <tr>
            <td>${gasto.tipo_gasto}</td>
            <td>${gasto.descripcion || '-'}</td>
            <td>${formatearMoneda(gasto.valor)}</td>
            <td>
                <button class="btn btn-sm btn-icon btn-danger" onclick="eliminarGasto(${gasto.id})" title="Eliminar">
                    🗑️
                </button>
            </td>
        </tr>
    `).join('');
}

function abrirFormGasto() {
    document.getElementById('formGastoContainer').style.display = 'block';
    document.getElementById('formGasto').reset();
    document.getElementById('gastoId').value = '';
    document.getElementById('gastoViajeId').value = viajeActual.id;
}

function cancelarFormGasto() {
    document.getElementById('formGastoContainer').style.display = 'none';
    document.getElementById('formGasto').reset();
}

async function eliminarGasto(gastoId) {
    if (!confirm('¿Está seguro de eliminar este gasto?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/gastos/${gastoId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarExito('Gasto eliminado exitosamente');
            verGastos(viajeActual.id); // Recargar gastos
        } else {
            mostrarError(data.message);
        }
    } catch (error) {
        console.error('Error al eliminar gasto:', error);
        mostrarError('Error al eliminar el gasto');
    }
}

function actualizarTotales() {
    document.getElementById('totalGastos').textContent = formatearMoneda(viajeActual.total_gastos);
    
    const saldoFinalEl = document.getElementById('saldoFinal');
    saldoFinalEl.textContent = formatearMoneda(viajeActual.saldo_final);
    saldoFinalEl.className = viajeActual.saldo_final >= 0 ? 'text-success' : 'text-danger';
}

// =================================
// TIPOS DE GASTOS
// =================================
async function cargarTiposGastos() {
    try {
        const response = await fetch(`${API_URL}/tipos-gastos?includeInactive=true`);
        const data = await response.json();
        
        if (data.success) {
            tiposGastos = data.data;
            mostrarTiposGastos(data.data);
            cargarSelectTiposGastos();
            refrescarSelectsGastosIniciales();
        }
    } catch (error) {
        console.error('Error al cargar tipos de gastos:', error);
        mostrarError('Error al cargar los tipos de gastos');
    }
}

function mostrarTiposGastos(tipos) {
    const tbody = document.getElementById('tiposGastosBody');
    
    if (tipos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading">No hay tipos de gastos registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = tipos.map(tipo => `
        <tr>
            <td>${tipo.nombre}</td>
            <td>${tipo.descripcion || '-'}</td>
            <td>
                <span class="badge ${tipo.activo ? 'badge-success' : 'badge-danger'}">
                    ${tipo.activo ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-icon btn-secondary" onclick="editarTipoGasto(${tipo.id})" title="Editar">
                    ✏️
                </button>
                <button class="btn btn-sm btn-icon btn-danger" onclick="eliminarTipoGasto(${tipo.id})" title="Eliminar">
                    🗑️
                </button>
            </td>
        </tr>
    `).join('');
}

function cargarSelectTiposGastos() {
    const select = document.getElementById('tipo_gasto_id');
    if (!select) return;

    select.innerHTML = opcionesTiposGastoActivos();
}

function opcionesTiposGastoActivos() {
    const tiposActivos = tiposGastos.filter(t => t.activo);
    return '<option value="">Seleccione...</option>' +
        tiposActivos.map(tipo => `<option value="${tipo.id}">${tipo.nombre}</option>`).join('');
}

function refrescarSelectsGastosIniciales() {
    const options = opcionesTiposGastoActivos();
    document.querySelectorAll('.gasto-tipo').forEach(select => {
        const current = select.value;
        select.innerHTML = options;
        if (current) {
            select.value = current;
        }
    });
}

// =================================
// GASTOS INICIALES (AL CREAR VIAJE)
// =================================
function resetGastosIniciales() {
    const cont = document.getElementById('gastosInicialesContainer');
    if (cont) {
        cont.innerHTML = '';
    }
    gastosInicialesTempId = 0;
}

function agregarGastoInicialFila(tipoId = '', valor = '', descripcion = '') {
    const cont = document.getElementById('gastosInicialesContainer');
    if (!cont) return;

    const rowId = `gasto-inicial-${++gastosInicialesTempId}`;
    const row = document.createElement('div');
    row.className = 'gasto-inicial-row';
    row.id = rowId;

    row.innerHTML = `
        <div class="form-group">
            <label>Tipo</label>
            <select class="gasto-tipo">${opcionesTiposGastoActivos()}</select>
        </div>
        <div class="form-group">
            <label>Valor</label>
            <input type="number" class="gasto-valor" step="1" placeholder="0">
        </div>
        <div class="form-group">
            <label>Descripción</label>
            <input type="text" class="gasto-descripcion" placeholder="Ej: Peaje, ACPM, cargue...">
        </div>
        <div class="form-group">
            <button type="button" class="btn btn-sm btn-ghost" onclick="eliminarGastoInicialFila('${rowId}')">✖</button>
        </div>
    `;

    cont.appendChild(row);

    // Set values if provided
    const select = row.querySelector('.gasto-tipo');
    if (tipoId) select.value = tipoId;
    const inputValor = row.querySelector('.gasto-valor');
    if (valor !== '') inputValor.value = valor;
    const inputDesc = row.querySelector('.gasto-descripcion');
    if (descripcion) inputDesc.value = descripcion;
}

function eliminarGastoInicialFila(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
    }
}

function obtenerGastosInicialesDelForm() {
    const cont = document.getElementById('gastosInicialesContainer');
    if (!cont) return [];

    const filas = [...cont.querySelectorAll('.gasto-inicial-row')];
    const gastos = [];

    filas.forEach(row => {
        const tipo = parseInt(row.querySelector('.gasto-tipo')?.value, 10);
        const valor = parseFloat(row.querySelector('.gasto-valor')?.value);
        const descripcion = row.querySelector('.gasto-descripcion')?.value || '';

        // Solo incluir filas con tipo y valor válidos
        if (!isNaN(tipo) && !isNaN(valor)) {
            gastos.push({
                tipo_gasto_id: tipo,
                valor,
                descripcion
            });
        }
    });

    return gastos;
}

function abrirModalTipoGasto(tipo = null) {
    const modal = document.getElementById('modalTipoGasto');
    const title = document.getElementById('modalTipoGastoTitle');
    const form = document.getElementById('formTipoGasto');
    
    form.reset();
    
    if (tipo) {
        title.textContent = 'Editar Tipo de Gasto';
        document.getElementById('tipoGastoId').value = tipo.id;
        document.getElementById('nombre_tipo').value = tipo.nombre;
        document.getElementById('descripcion_tipo').value = tipo.descripcion || '';
        document.getElementById('activo_tipo').checked = tipo.activo;
    } else {
        title.textContent = 'Nuevo Tipo de Gasto';
        document.getElementById('tipoGastoId').value = '';
        document.getElementById('activo_tipo').checked = true;
    }
    
    modal.style.display = 'block';
}

function cerrarModalTipoGasto() {
    document.getElementById('modalTipoGasto').style.display = 'none';
}

async function editarTipoGasto(id) {
    try {
        const response = await fetch(`${API_URL}/tipos-gastos/${id}`);
        const data = await response.json();
        
        if (data.success) {
            abrirModalTipoGasto(data.data);
        }
    } catch (error) {
        console.error('Error al cargar tipo de gasto:', error);
        mostrarError('Error al cargar el tipo de gasto');
    }
}

async function eliminarTipoGasto(id) {
    if (!confirm('¿Está seguro de eliminar este tipo de gasto? Si está en uso, solo se desactivará.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/tipos-gastos/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            if (data.message && data.message.includes('eliminado')) {
                mostrarExito('Tipo de gasto eliminado permanentemente');
            } else {
                mostrarExito('Tipo de gasto desactivado porque está en uso');
            }
            cargarTiposGastos();
        } else {
            mostrarError(data.message);
        }
    } catch (error) {
        console.error('Error al eliminar tipo de gasto:', error);
        mostrarError('Error al eliminar el tipo de gasto');
    }
}

// =================================
// FORMULARIOS
// =================================
function configurarFormularios() {
    // Form Viaje
    document.getElementById('formViaje').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const viajeId = document.getElementById('viajeId').value;
        const viajeData = {
            fecha_viaje: document.getElementById('fecha_viaje').value,
            material_transportado: document.getElementById('material_transportado').value,
            origen: document.getElementById('origen').value,
            destino: document.getElementById('destino').value,
            kilos_transportados: parseFloat(document.getElementById('kilos_transportados').value),
            valor_flete: parseFloat(document.getElementById('valor_flete').value),
            placa_vehiculo: document.getElementById('placa_vehiculo').value,
            anticipo: 0,
            observaciones: document.getElementById('observaciones').value
        };

        const gastosIniciales = obtenerGastosInicialesDelForm();
        if (gastosIniciales.length > 0) {
            viajeData.gastos = gastosIniciales;
        }
        
        try {
            const url = viajeId ? `${API_URL}/viajes/${viajeId}` : `${API_URL}/viajes`;
            const method = viajeId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(viajeData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                mostrarExito(viajeId ? 'Viaje actualizado exitosamente' : 'Viaje creado exitosamente');
                cerrarModalViaje();
                cargarViajes();
            } else {
                mostrarError(data.message || 'Error al guardar el viaje');
            }
        } catch (error) {
            console.error('Error al guardar viaje:', error);
            mostrarError('Error al guardar el viaje');
        }
    });
    
    // Form Gasto
    document.getElementById('formGasto').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const gastoData = {
            viaje_id: parseInt(document.getElementById('gastoViajeId').value),
            tipo_gasto_id: parseInt(document.getElementById('tipo_gasto_id').value),
            valor: parseFloat(document.getElementById('valor_gasto').value),
            descripcion: document.getElementById('descripcion_gasto').value
        };
        
        try {
            const response = await fetch(`${API_URL}/gastos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gastoData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                mostrarExito('Gasto agregado exitosamente');
                cancelarFormGasto();
                verGastos(viajeActual.id); // Recargar gastos
            } else {
                mostrarError(data.message || 'Error al guardar el gasto');
            }
        } catch (error) {
            console.error('Error al guardar gasto:', error);
            mostrarError('Error al guardar el gasto');
        }
    });
    
    // Form Tipo Gasto
    document.getElementById('formTipoGasto').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const tipoGastoId = document.getElementById('tipoGastoId').value;
        const tipoGastoData = {
            nombre: document.getElementById('nombre_tipo').value,
            descripcion: document.getElementById('descripcion_tipo').value,
            activo: document.getElementById('activo_tipo').checked
        };
        
        try {
            const url = tipoGastoId ? `${API_URL}/tipos-gastos/${tipoGastoId}` : `${API_URL}/tipos-gastos`;
            const method = tipoGastoId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tipoGastoData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                mostrarExito(tipoGastoId ? 'Tipo de gasto actualizado' : 'Tipo de gasto creado');
                cerrarModalTipoGasto();
                cargarTiposGastos();
            } else {
                mostrarError(data.message || 'Error al guardar el tipo de gasto');
            }
        } catch (error) {
            console.error('Error al guardar tipo de gasto:', error);
            mostrarError('Error al guardar el tipo de gasto');
        }
    });
}

// =================================
// UTILIDADES
// =================================
function formatearFecha(fecha) {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatearMoneda(valor) {
    return '$' + parseFloat(valor).toLocaleString('es-CO', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
    });
}

function mostrarExito(mensaje) {
    alert('✅ ' + mensaje);
}

function mostrarError(mensaje) {
    alert('❌ ' + mensaje);
}

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};
