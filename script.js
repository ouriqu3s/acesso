const portariaCoords = "-7.152322930921254, -34.8093231129095";
const searchTypeSelect = document.getElementById('searchType');
const searchValueSelect = document.getElementById('searchValue');
const qrForm = document.getElementById('qrForm');
const proprietarioInfoDiv = document.getElementById('proprietarioInfo');
const linkContainer = document.getElementById('linkContainer');

// Função para carregar os dados das casas do arquivo JSON
async function loadHouseData() {
    try {
        const response = await fetch('houses.json');
        if (!response.ok) {
            throw new Error('Erro ao carregar os dados das casas.');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        alert(error.message);
        return [];
    }
}

// Função para extrair as coordenadas do WKT
function getCoordinatesFromWKT(wkt) {
    const regex = /POINT \(([-\d.]+) ([-\d.]+)\)/;
    const match = wkt.match(regex);
    if (match) {
        return `${match[2]}, ${match[1]}`;
    }
    return null;
}

// Função para popular as opções de destino
async function populateSearchValues() {
    const searchType = searchTypeSelect.value;
    searchValueSelect.innerHTML = '';

    const houseData = await loadHouseData();
    const valuesSet = new Set();

    houseData.forEach(house => {
        const value = house[searchType];
        if (value && !valuesSet.has(value)) {
            valuesSet.add(value);
        }
    });

    const sortedValues = Array.from(valuesSet);

    if (searchType === "Nº da Casa" || searchType === "Quadra-Lote") {
        sortedValues.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    }

    sortedValues.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        searchValueSelect.appendChild(option);
    });
}

// Função para gerar o QR Code
async function generateQRCode(event) {
    event.preventDefault();

    const searchType = searchTypeSelect.value;
    const searchValue = searchValueSelect.value;

    const houseData = await loadHouseData();
    const house = houseData.find(house => house[searchType] === searchValue);

    if (house) {
        const destinationCoords = getCoordinatesFromWKT(house['WKT']);

        if (!destinationCoords) {
            alert('Coordenadas inválidas para o destino selecionado.');
            return;
        }

        const googleMaps = `https://www.google.com/maps/dir/?api=1&origin=${portariaCoords}&destination=${destinationCoords}&travelmode=driving`;

        const universalLink = `geo:${destinationCoords}?q=${destinationCoords}&mode=d`;

        document.getElementById('qrcode').innerHTML = '';

        new QRCode(document.getElementById('qrcode'), {
            text: universalLink,
            width: 256,
            height: 256,
        });

        proprietarioInfoDiv.textContent = `Nº da Casa: ${house['Nº da Casa']}, Quadra: ${house['Quadra']}, Lote: ${house['Lote']}`;

        linkContainer.innerHTML = '';
        const link = document.createElement('a');
        link.href = googleMaps;
        link.target = '_blank';
        link.textContent = 'Clique aqui para abrir o trajeto no Google Maps';
        linkContainer.appendChild(link);
    } else {
        alert('Destino não encontrado.');
    }
}

// Eventos
searchTypeSelect.addEventListener('change', populateSearchValues);
qrForm.addEventListener('submit', generateQRCode);

// Inicialização
populateSearchValues();
