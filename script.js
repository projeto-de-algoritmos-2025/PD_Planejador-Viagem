document.addEventListener('DOMContentLoaded', () => {

    const itemForm = document.getElementById('item-form');
    const itemsList = document.getElementById('items-list');
    const optimizeButton = document.getElementById('optimize-button');
    const resultSection = document.getElementById('result-section');
    const capacityInput = document.getElementById('capacity');

    let items = [];
    let itemId = 0;


    function renderItems() {
        itemsList.innerHTML = '';
        if (items.length === 0) {
            itemsList.innerHTML = '<p class="empty-state">Nenhum item adicionado ainda...</p>';
            return;
        }

        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('item-card');


            itemElement.innerHTML = `
                <button class="delete-btn" data-id="${item.id}">&times;</button>
                <span class="icon">${item.icon}</span>
                <strong>${item.name}</strong>
                <p>Peso: ${item.weight} kg</p>
                <p>Valor: ${item.value}</p>
            `;
            itemsList.appendChild(itemElement);
        });
    }


    itemsList.addEventListener('click', (e) => {

        if (e.target.classList.contains('delete-btn')) {

            const idToRemove = parseInt(e.target.dataset.id, 10);


            items = items.filter(item => item.id !== idToRemove);


            renderItems();
        }
    });


    itemForm.addEventListener('submit', (e) => {
        e.preventDefault();


        const name = document.getElementById('item-name').value;
        const weight = parseFloat(document.getElementById('item-weight').value);
        const value = parseInt(document.getElementById('item-value').value, 10);
        const icon = document.getElementById('item-icon').value;


        items.push({ id: itemId++, name, weight, value, icon });


        renderItems();


        itemForm.reset();
    });


    optimizeButton.addEventListener('click', () => {
        const capacity = parseInt(capacityInput.value, 10);

        if (items.length === 0) {
            alert('Por favor, adicione pelo menos um item antes de otimizar!');
            return;
        }


        const result = knapsack(items, capacity);


        displayResults(result);
    });

    /**
     * @param {Array} items - Array de objetos, cada um com 'weight' e 'value'
     * @param {number} capacity - A capacidade máxima da mochila
     * @returns {Object} - Objeto com o valor máximo, peso total e a lista de itens selecionados
     */
    function knapsack(items, capacity) {
        const n = items.length;

        const dp = Array(n + 1).fill(0).map(() => Array(capacity + 1).fill(0));


        for (let i = 1; i <= n; i++) {
            const currentWeight = items[i - 1].weight;
            const currentValue = items[i - 1].value;

            for (let w = 1; w <= capacity; w++) {
                if (currentWeight > w) {

                    dp[i][w] = dp[i - 1][w];
                } else {

                    dp[i][w] = Math.max(
                        dp[i - 1][w],
                        currentValue + dp[i - 1][w - Math.floor(currentWeight)]
                    );
                }
            }
        }


        let selectedItems = [];
        let totalWeight = 0;
        let w = capacity;
        for (let i = n; i > 0 && w > 0; i--) {

            if (dp[i][w] !== dp[i - 1][w]) {
                const item = items[i - 1];
                selectedItems.push(item);
                totalWeight += item.weight;
                w -= Math.floor(item.weight);
            }
        }

        return {
            maxValue: dp[n][capacity],
            totalWeight: parseFloat(totalWeight.toFixed(2)),
            selectedItems: selectedItems.reverse()
        };
    }


    function displayResults(result) {
        resultSection.style.display = 'block';


        document.getElementById('max-value').textContent = result.maxValue;
        document.getElementById('total-weight').textContent = result.totalWeight;

        const selectedItemsContainer = document.getElementById('selected-items');
        const leftoverItemsContainer = document.getElementById('leftover-items');

        selectedItemsContainer.innerHTML = '';
        leftoverItemsContainer.innerHTML = '';

        const selectedIds = new Set(result.selectedItems.map(item => item.id));

        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('item-card');
            itemElement.innerHTML = `
                <span class="icon">${item.icon}</span>
                <strong>${item.name}</strong>
                <p>Peso: ${item.weight} kg</p>
                <p>Valor: ${item.value}</p>
            `;


            if (selectedIds.has(item.id)) {
                selectedItemsContainer.appendChild(itemElement);
            } else {
                leftoverItemsContainer.appendChild(itemElement);
            }
        });

        if (selectedItemsContainer.innerHTML === '') {
            selectedItemsContainer.innerHTML = '<p class="empty-state">Nenhum item coube na mochila!</p>';
        }
        if (leftoverItemsContainer.innerHTML === '') {
            leftoverItemsContainer.innerHTML = '<p class="empty-state">Todos os itens foram para a mochila!</p>';
        }


        resultSection.scrollIntoView({ behavior: 'smooth' });
    }


    renderItems();
});