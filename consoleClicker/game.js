$(function () {
    const gameData = {
        money: 100,
        inventory: {},
        unlockedCommands: ['help', 'work', 'buy', 'inventory', 'upgrade'],
        unlockedItems: ['marketing', 'tool', 'lemonadeStand'],
        upgrades: [],
        ui: {},
        boosted: false
    };

    loadGame();
    updateUI();

    function saveGame() {
        try {
            localStorage.setItem('terminalTycoonSave', JSON.stringify(gameData));
        } catch (e) {
            console.error('Save failed:', e);
        }
    }

    function loadGame() {
        try {
            const saved = null //JSON.parse(localStorage.getItem('terminalTycoonSave'));
            if (saved) {
                Object.assign(gameData, saved);
                unlockAvailableItems();
            }
        } catch (e) {
            console.error('Load failed:', e);
        }
    }

    function updateUI() {
        if (gameData.ui.moneyPanel) {
            $('#money-panel').show();
            updateMoneyUI();
        }
    }    

    const items = {
        marketing: {
            displayName: "Yard Sign",
            price: 100,
            unlocksCommand: 'sign',
            description: 'Boosts all production by 10%.'
        },
        tool: {
            displayName: "Tool",
            price: 10,
            description: 'Reduces work time by 20% per tool.'
        },
        lemonadeStand: {
            displayName: "Lemonade Stand",
            price: 60,
            description: 'Generates $1 every 3 seconds.',
            payout: 1,
            interval: 3000
        },
        vendingMachine: {
            displayName: "Vending Machine",
            price: 120,
            description: 'Generates $3 every 5 seconds.',
            requires: 'lemonadeStand',
            payout: 3,
            interval: 5000
        },
        atm: {
            displayName: "ATM",
            price: 300,
            description: 'Generates $10 every 10 seconds.',
            requires: 'vendingMachine',
            payout: 10,
            interval: 10000
        }
    };

    const upgrades = {
        billboard: {
            displayName: "Billboard Ad",
            price: 50,
            description: "Unlocks 'boost' command to double income temporarily.",
            onPurchase: () => {
                if (!gameData.unlockedCommands.includes("boost")) {
                    gameData.unlockedCommands.push("boost");
                    echoOutput($('#terminal').terminal(), 'Unlocked command: "boost"');
                }
            }
        },
        moneyPanel: {
            displayName: "Money Panel",
            price: 30,
            description: "Unlocks the Money stats panel.",
            onPurchase: () => {
                gameData.ui.moneyPanel = true;
                echoOutput($('#terminal').terminal(), '📊 Stats panel unlocked!');
                updateUI();
            }
        }
    };
    

    function echoOutput(term, ...lines) {
        lines.forEach(line => term.echo(`[[;white;]${line}]`));
    }

    function unlockAvailableItems() {
        for (const [key, item] of Object.entries(items)) {
            if (!gameData.unlockedItems.includes(key)) {
                if (item.requires && gameData.inventory[item.requires] >= 1) {
                    gameData.unlockedItems.push(key);
                }
            }
        }
    }

    function getPrinterBonus() {
        const count = gameData.inventory.printer || 0;
        return 1 + (count * 0.1);
    }

    function getToolReduction() {
        const count = gameData.inventory.tool || 0;
        return Math.pow(0.8, count);
    }

    const commandMap = {
        help: {
            description: 'Show available commands.',
            execute: (args, term) => {
                echoOutput(term, 'Available commands:');
                gameData.unlockedCommands.forEach(cmd => {
                    echoOutput(term, `${cmd} - ${commandMap[cmd]?.description || ''}`);
                });
            }
        },
        work: {
            description: 'Manual labor for $10 (bonus from printers).',
            execute: (args, term) => {
                const basePay = 10;
                const pay = basePay * getPrinterBonus();
                const delay = Math.floor(5000 * getToolReduction());
                const dots = ['.', '..', '...'];
                let step = 0;

                const interval = setInterval(() => {
                    term.set_prompt('');
                    term.echo(dots[step % dots.length]);
                    step++;
                }, 500);

                setTimeout(() => {
                    clearInterval(interval);
                    gameData.money += pay;
                    echoOutput(term, `You earned $${pay.toFixed(2)}! Total: $${gameData.money.toFixed(2)}`);
                    term.set_prompt('[[;#00ff00;]> ]');
                }, delay);
            }
        },
        checkCash: {
            description: 'Show your current balance.',
            execute: (args, term) => {
                echoOutput(term, `Balance: $${gameData.money.toFixed(2)}`);
            }
        },
        buy: {
            description: 'Buy an item (e.g. buy printer [amount]), or run without arguments to view available items.',
            execute: (args, term) => {
                const itemName = args[0];
                const quantity = Math.max(1, parseInt(args[1]) || 1);
        
                if (!itemName) {
                    echoOutput(term, 'Available Items:');
                    gameData.unlockedItems.forEach(name => {
                        const item = items[name];
                        const owned = gameData.inventory[name] || 0;
                        const unlockNote = item?.unlocksCommand ? ` (unlocks "${item.unlocksCommand}")` : '';
                        echoOutput(term, `${name} - ${item.displayName} (Owned: ${owned}) - $${item.price} :: ${item.description}${unlockNote}`);
                    });
                    return;
                }
        
                if (!gameData.unlockedItems.includes(itemName)) {
                    return echoOutput(term, `Item "${itemName}" is not available.`);
                }
        
                const item = items[itemName];
                const totalCost = item.price * quantity;
        
                if (gameData.money < totalCost) {
                    return echoOutput(term, `Insufficient funds. ${item.displayName} x${quantity} costs $${totalCost}, but you have $${gameData.money.toFixed(2)}.`);
                }
        
                gameData.money -= totalCost;
                gameData.inventory[itemName] = (gameData.inventory[itemName] || 0) + quantity;
        
                echoOutput(term, `Purchased ${item.displayName} x${quantity} for $${totalCost}. Remaining: $${gameData.money.toFixed(2)}`);
        
                if (item.unlocksCommand && !gameData.unlockedCommands.includes(item.unlocksCommand)) {
                    gameData.unlockedCommands.push(item.unlocksCommand);
                    echoOutput(term, `Unlocked command: "${item.unlocksCommand}"`);
                }
        
                unlockAvailableItems();
            }
        },
        
        inventory: {
            description: 'List all owned items.',
            execute: (args, term) => {
                const keys = Object.keys(gameData.inventory);
                if (keys.length === 0) {
                    echoOutput(term, 'No items purchased yet.');
                } else {
                    echoOutput(term, 'Your Inventory:');
                    keys.forEach(item => {
                        const displayName = items[item]?.displayName || item;
                        echoOutput(term, `${displayName} x${gameData.inventory[item]}`);
                    });
                }
            }
        },
        upgrade: {
            description: 'Buy a one-time upgrade (e.g. upgrade billboard).',
            execute: (args, term) => {
                const name = args[0];
        
                if (!name) {
                    echoOutput(term, 'Available Upgrades:');
                    for (const [key, upg] of Object.entries(upgrades)) {
                        const owned = gameData.upgrades.includes(key);
                        const status = owned ? 'Owned' : `$${upg.price}`;
                        echoOutput(term, `- (${status}) ${key} - ${upg.displayName} :: ${upg.description}`);
                    }
                    return;
                }
        
                const upgrade = upgrades[name];
                if (!upgrade) return echoOutput(term, `Upgrade "${name}" not found.`);
                if (gameData.upgrades.includes(name)) return echoOutput(term, `Upgrade "${name}" already purchased.`);
                if (gameData.money < upgrade.price) return echoOutput(term, `Not enough funds. You need $${upgrade.price}.`);
        
                gameData.money -= upgrade.price;
                gameData.upgrades.push(name);
                echoOutput(term, `Purchased upgrade: ${upgrade.displayName} for $${upgrade.price}`);
        
                if (typeof upgrade.onPurchase === 'function') {
                    upgrade.onPurchase(term);
                }
            }
        }        
    };

    for (const [name, item] of Object.entries(items)) {
        if (item.payout && item.interval) {
            setInterval(() => {
                const count = gameData.inventory[name] || 0;
                if (count > 0) {
                    const income = count * item.payout;
                    gameData.money += income;
                    if (!gameData.ui?.moneyPanel) {
                        echoOutput($('#terminal').terminal(), `💰 Passive income from ${item.displayName} x${count}: +$${income.toFixed(2)} [balance: $${gameData.money.toFixed(2)}]`);
                    }
                }
            }, item.interval);
        }
    }

    $('#terminal').terminal(function (input, term) {
        const args = input.trim().split(/\s+/);
        const cmd = args[0];
        const command = commandMap[cmd];

        if (!cmd) return;

        if (gameData.unlockedCommands.includes(cmd) && typeof command?.execute === 'function') {
            try {
                command.execute(args.slice(1), term);
            } catch (e) {
                echoOutput(term, `Error running "${cmd}": ${e.message}`);
            }
        } else {
            echoOutput(term, `Unknown or locked command: "${cmd}"`);
        }
    }, {
        prompt: '[[;#00ff00;]> ]',
        greetings: '💼 Welcome to Terminal Tycoon!\nType "help" to see available commands.',
        name: 'tycoon_terminal_game',
        height: 600,
        width: 800,
        history: true,
        completion: function(command) {
            const token = command.trim().split(/\s+/).pop().toLowerCase();
            const allSuggestions = [...gameData.unlockedCommands, ...gameData.unlockedItems, ...Object.keys(upgrades)];
            return allSuggestions.filter(entry => entry.startsWith(token));
        }
    });

    function updateMoneyUI() {
        $('#money-value').text(gameData.money.toFixed(2));
    }
    

    setInterval(() => {
        const term = $('#terminal').terminal();
        const output = term.find('.terminal-output > div');
        if (output.length > 200) {
            output.slice(0, output.length - 200).remove();
        }
        saveGame();
        updateMoneyUI();
    }, 1000);
});
