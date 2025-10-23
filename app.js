// BinText - Binary and Leet Text Converter
(function() {
    'use strict';
    
    // Leet speak mapping
    const leetMap = {
        'A': '4', 'a': '4',
        'E': '3', 'e': '3', 
        'I': '1', 'i': '1',
        'O': '0', 'o': '0',
        'S': '5', 's': '5',
        'T': '7', 't': '7',
        'L': '1', 'l': '1',
        'G': '9', 'g': '9',
        'B': '8', 'b': '8',
        'Z': '2', 'z': '2'
    };
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        console.log('Initializing BinText...');
        
        // Get all elements
        const inputField = document.getElementById('inputText');
        const outputField = document.getElementById('outputText');
        const charCountEl = document.getElementById('charCount');
        const wordCountEl = document.getElementById('wordCount');
        const binaryLengthEl = document.getElementById('binaryLength');
        const byteCountEl = document.getElementById('byteCount');
        const stepsEl = document.getElementById('conversionSteps');
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        const inputError = document.getElementById('inputError');
        
        // Mode buttons
        const textToBinaryBtn = document.getElementById('textToBinary');
        const binaryToTextBtn = document.getElementById('binaryToText');
        const textToLeetBtn = document.getElementById('textToLeet');
        
        // Control buttons
        const copyBtn = document.getElementById('copyBtn');
        const clearBtn = document.getElementById('clearBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const themeToggle = document.getElementById('themeToggle');
        
        // State
        let currentMode = 'text-to-binary';
        
        // Verify all elements exist
        if (!inputField || !outputField) {
            console.error('Critical elements missing!');
            return;
        }
        
        // Conversion functions
        function textToBinary(text) {
            if (!text) return '';
            return text.split('').map(char => {
                return char.charCodeAt(0).toString(2).padStart(8, '0');
            }).join(' ');
        }
        
        function binaryToText(binary) {
            if (!binary) return '';
            const chunks = binary.trim().split(/\s+/);
            return chunks.map(chunk => {
                if (chunk.length === 0) return '';
                const decimal = parseInt(chunk, 2);
                if (isNaN(decimal)) return '';
                return String.fromCharCode(decimal);
            }).join('');
        }
        
        function textToLeet(text) {
            if (!text) return '';
            return text.split('').map(char => {
                return leetMap[char] || char;
            }).join('');
        }
        
        function isValidBinary(binary) {
            if (!binary) return true;
            const cleaned = binary.replace(/\s+/g, '');
            return /^[01]*$/.test(cleaned);
        }
        
        // Show notification
        function showNotification(message, type = 'success') {
            if (!notification || !notificationText) return;
            
            notificationText.textContent = message;
            notification.className = `notification ${type} show`;
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
        
        // Show/hide error
        function showError(message) {
            if (!inputError) return;
            inputError.textContent = message;
            inputError.classList.remove('hidden');
        }
        
        function hideError() {
            if (!inputError) return;
            inputError.classList.add('hidden');
        }
        
        // Update statistics
        function updateStats() {
            const inputText = inputField ? inputField.value : '';
            const outputText = outputField ? outputField.value : '';
            
            const charCount = inputText.length;
            const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
            
            let binaryLength = 0;
            if (currentMode === 'text-to-binary') {
                binaryLength = outputText.replace(/\s+/g, '').length;
            } else if (currentMode === 'binary-to-text') {
                binaryLength = inputText.replace(/\s+/g, '').length;
            } else {
                binaryLength = inputText.length * 8; // Approximate for leet
            }
            
            const byteCount = Math.ceil(binaryLength / 8);
            
            if (charCountEl) charCountEl.textContent = charCount;
            if (wordCountEl) wordCountEl.textContent = wordCount;
            if (binaryLengthEl) binaryLengthEl.textContent = binaryLength;
            if (byteCountEl) byteCountEl.textContent = byteCount;
        }
        
        // Update conversion steps
        function updateSteps(input = '') {
            if (!stepsEl) return;
            
            if (!input.trim()) {
                stepsEl.innerHTML = '<p class="steps-placeholder">Enter text to see conversion steps...</p>';
                return;
            }
            
            let stepsHTML = '';
            
            if (currentMode === 'text-to-binary') {
                const chars = input.split('').slice(0, 3);
                chars.forEach((char, index) => {
                    const ascii = char.charCodeAt(0);
                    const binary = ascii.toString(2).padStart(8, '0');
                    stepsHTML += `
                        <div class="conversion-step">
                            <div class="step-title">Step ${index + 1}: '${char}'</div>
                            <div class="step-detail">ASCII: ${ascii} → Binary: ${binary}</div>
                        </div>
                    `;
                });
                
                if (input.length > 3) {
                    stepsHTML += `
                        <div class="conversion-step">
                            <div class="step-title">... and ${input.length - 3} more characters</div>
                        </div>
                    `;
                }
            } else if (currentMode === 'binary-to-text') {
                const chunks = input.trim().split(/\s+/).slice(0, 3);
                chunks.forEach((chunk, index) => {
                    if (chunk.length > 0) {
                        const decimal = parseInt(chunk, 2);
                        const char = String.fromCharCode(decimal);
                        stepsHTML += `
                            <div class="conversion-step">
                                <div class="step-title">Step ${index + 1}: ${chunk}</div>
                                <div class="step-detail">Binary → ASCII: ${decimal} → '${char}'</div>
                            </div>
                        `;
                    }
                });
                
                const totalChunks = input.trim().split(/\s+/).length;
                if (totalChunks > 3) {
                    stepsHTML += `
                        <div class="conversion-step">
                            <div class="step-title">... and ${totalChunks - 3} more chunks</div>
                        </div>
                    `;
                }
            } else if (currentMode === 'text-to-leet') {
                const chars = input.split('').slice(0, 5);
                chars.forEach((char, index) => {
                    const leetChar = leetMap[char] || char;
                    const hasMapping = leetMap[char] !== undefined;
                    stepsHTML += `
                        <div class="conversion-step">
                            <div class="step-title">Step ${index + 1}: '${char}'</div>
                            <div class="step-detail">
                                ${hasMapping ? 
                                    `<span class="leet-mapping">'${char}' → '${leetChar}'</span>` : 
                                    `No mapping, keep as '${char}'`
                                }
                            </div>
                        </div>
                    `;
                });
                
                if (input.length > 5) {
                    stepsHTML += `
                        <div class="conversion-step">
                            <div class="step-title">... and ${input.length - 5} more characters</div>
                        </div>
                    `;
                }
            }
            
            stepsEl.innerHTML = stepsHTML;
        }
        
        // Main conversion function
        function performConversion() {
            if (!inputField || !outputField) return;
            
            const input = inputField.value;
            hideError();
            
            if (!input.trim()) {
                outputField.value = '';
                outputField.classList.remove('leet-output');
                updateStats();
                updateSteps();
                return;
            }
            
            try {
                let result = '';
                
                if (currentMode === 'text-to-binary') {
                    result = textToBinary(input);
                    outputField.classList.remove('leet-output');
                } else if (currentMode === 'binary-to-text') {
                    if (!isValidBinary(input)) {
                        showError('Invalid binary input. Please use only 0s, 1s, and spaces.');
                        outputField.value = '';
                        updateStats();
                        updateSteps();
                        return;
                    }
                    result = binaryToText(input);
                    outputField.classList.remove('leet-output');
                } else if (currentMode === 'text-to-leet') {
                    result = textToLeet(input);
                    outputField.classList.add('leet-output');
                }
                
                outputField.value = result;
                updateStats();
                updateSteps(input);
                
            } catch (error) {
                console.error('Conversion error:', error);
                showError('Conversion error: ' + error.message);
                outputField.value = '';
                updateStats();
                updateSteps();
            }
        }
        
        // Set mode function
        function setMode(mode) {
            console.log('Setting mode to:', mode);
            currentMode = mode;
            
            // Update button states
            const allModeButtons = [textToBinaryBtn, binaryToTextBtn, textToLeetBtn];
            allModeButtons.forEach(btn => {
                if (btn) {
                    btn.classList.remove('active', 'btn--primary');
                    btn.classList.add('btn--secondary');
                }
            });
            
            // Find and activate the correct button
            let activeBtn = null;
            if (mode === 'text-to-binary') activeBtn = textToBinaryBtn;
            else if (mode === 'binary-to-text') activeBtn = binaryToTextBtn;
            else if (mode === 'text-to-leet') activeBtn = textToLeetBtn;
            
            if (activeBtn) {
                activeBtn.classList.add('active', 'btn--primary');
                activeBtn.classList.remove('btn--secondary');
            }
            
            // Update placeholders
            const placeholders = {
                'text-to-binary': 'Enter text to convert to binary...',
                'binary-to-text': 'Enter binary (0s and 1s) to convert to text...',
                'text-to-leet': 'Enter text to convert to leet speak...'
            };
            
            const outputPlaceholders = {
                'text-to-binary': 'Binary output will appear here...',
                'binary-to-text': 'Text output will appear here...',
                'text-to-leet': 'Leet speak output will appear here...'
            };
            
            if (inputField) inputField.placeholder = placeholders[mode];
            if (outputField) outputField.placeholder = outputPlaceholders[mode];
            
            // Clear output and reconvert if there's input
            const currentInput = inputField ? inputField.value : '';
            if (outputField) {
                outputField.value = '';
                outputField.classList.remove('leet-output');
            }
            hideError();
            
            // If there's existing input, perform conversion
            if (currentInput.trim()) {
                performConversion();
            } else {
                updateStats();
                updateSteps();
            }
        }
        
        // Theme toggle
        function toggleTheme() {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-color-scheme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-color-scheme', newTheme);
            
            // Store preference
            try {
                localStorage.setItem('theme', newTheme);
            } catch (e) {
                console.warn('Could not save theme preference');
            }
            
            // Update icon
            const icon = themeToggle ? themeToggle.querySelector('.theme-icon') : null;
            if (icon) {
                icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
            }
            
            showNotification(`Switched to ${newTheme} mode`);
        }
        
        // Copy to clipboard
        async function copyToClipboard() {
            const text = outputField ? outputField.value : '';
            if (!text) {
                showNotification('Nothing to copy!', 'error');
                return;
            }
            
            try {
                await navigator.clipboard.writeText(text);
                showNotification('Copied to clipboard!');
            } catch (err) {
                // Fallback
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    showNotification('Copied to clipboard!');
                } catch (e) {
                    showNotification('Copy failed!', 'error');
                }
                document.body.removeChild(textArea);
            }
        }
        
        // Clear all
        function clearAll() {
            if (inputField) inputField.value = '';
            if (outputField) {
                outputField.value = '';
                outputField.classList.remove('leet-output');
            }
            hideError();
            updateStats();
            updateSteps();
            showNotification('Fields cleared!');
        }
        
        // Download file
        function downloadFile() {
            const content = outputField ? outputField.value : '';
            if (!content) {
                showNotification('Nothing to download!', 'error');
                return;
            }
            
            const modeNames = {
                'text-to-binary': 'binary',
                'binary-to-text': 'text',
                'text-to-leet': 'leet'
            };
            
            const filename = `bintext_${modeNames[currentMode]}_${new Date().toISOString().slice(0, 10)}.txt`;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            showNotification('File downloaded!');
        }
        
        // Add event listeners
        if (inputField) {
            inputField.addEventListener('input', performConversion);
        }
        
        if (textToBinaryBtn) {
            textToBinaryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                setMode('text-to-binary');
            });
        }
        
        if (binaryToTextBtn) {
            binaryToTextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                setMode('binary-to-text');
            });
        }
        
        if (textToLeetBtn) {
            textToLeetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                setMode('text-to-leet');
            });
        }
        
        if (copyBtn) {
            copyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                copyToClipboard();
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                clearAll();
            });
        }
        
        if (downloadBtn) {
            downloadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                downloadFile();
            });
        }
        
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                toggleTheme();
            });
        }
        
        // Initialize theme
        let savedTheme = 'light';
        try {
            savedTheme = localStorage.getItem('theme') || 'light';
        } catch (e) {
            console.warn('Could not read theme preference');
        }
        
        document.documentElement.setAttribute('data-color-scheme', savedTheme);
        const icon = themeToggle ? themeToggle.querySelector('.theme-icon') : null;
        if (icon) {
            icon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        }
        
        // Initialize stats and perform initial conversion if needed
        updateStats();
        updateSteps();
        
        // Trigger initial conversion if there's content
        if (inputField && inputField.value.trim()) {
            performConversion();
        }
        
        console.log('BinText initialized successfully!');
    }
})();