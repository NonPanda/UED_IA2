document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('accessible-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const experienceRadios = document.querySelectorAll('input[name="experience"]');
    const featureCheckboxes = document.querySelectorAll('input[name="features"]');
    const feedbackInput = document.getElementById('feedback');
    const srAnnouncements = document.getElementById('sr-announcements');

    const fontIncreaseBtn = document.getElementById('font-increase');
    const fontDecreaseBtn = document.getElementById('font-decrease');
    const contrastToggleBtn = document.getElementById('contrast-toggle');
    const motionToggleBtn = document.getElementById('motion-toggle');
    const keyboardToggleBtn = document.getElementById('keyboard-toggle');

    let currentHtmlFontSize = 16;
    let reducedMotion = false;
    let activeInput = null;

    function announce(message) {
        srAnnouncements.textContent = message;
        setTimeout(() => { srAnnouncements.textContent = ''; }, 1000);
    }

    function updateRootFontSize(newSize) {
        currentHtmlFontSize = Math.max(12, Math.min(24, newSize));
        document.documentElement.style.fontSize = `${currentHtmlFontSize}px`;
        localStorage.setItem('fontSize', currentHtmlFontSize);
    }

    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        updateRootFontSize(parseInt(savedFontSize));
    }

    const savedContrast = localStorage.getItem('highContrast');
    if (savedContrast === 'true') {
        document.body.classList.add('high-contrast');
    }

    const savedMotion = localStorage.getItem('reducedMotion');
    if (savedMotion === 'true') {
        reducedMotion = true;
        document.body.classList.add('reduced-motion');
    }

    fontIncreaseBtn.addEventListener('click', () => {
        updateRootFontSize(currentHtmlFontSize + 2);
        announce('Font size increased');
    });
    
    fontDecreaseBtn.addEventListener('click', () => {
        updateRootFontSize(currentHtmlFontSize - 2);
        announce('Font size decreased');
    });
    
    contrastToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('high-contrast');
        const isHighContrast = document.body.classList.contains('high-contrast');
        localStorage.setItem('highContrast', isHighContrast);
        announce(isHighContrast ? 'High contrast enabled' : 'High contrast disabled');
    });

    motionToggleBtn.addEventListener('click', () => {
        reducedMotion = !reducedMotion;
        document.body.classList.toggle('reduced-motion');
        localStorage.setItem('reducedMotion', reducedMotion);
        announce(reducedMotion ? 'Reduced motion enabled' : 'Reduced motion disabled');
    });

    const virtualKeyboard = document.getElementById('virtual-keyboard');
    const keyboardCloseBtn = document.getElementById('keyboard-close');
    const keys = document.querySelectorAll('.key');
    let capsLockActive = false;
    let shiftActive = false;

    keyboardToggleBtn.addEventListener('click', () => {
        virtualKeyboard.classList.toggle('hidden');
        const isVisible = !virtualKeyboard.classList.contains('hidden');
        localStorage.setItem('virtualKeyboard', isVisible);
        announce(isVisible ? 'Virtual keyboard opened' : 'Virtual keyboard closed');
        
        if (isVisible && activeInput) {
            activeInput.focus();
        }
    });

    keyboardCloseBtn.addEventListener('click', () => {
        virtualKeyboard.classList.add('hidden');
        localStorage.setItem('virtualKeyboard', false);
        announce('Virtual keyboard closed');
    });

    const savedKeyboard = localStorage.getItem('virtualKeyboard');
    if (savedKeyboard === 'true') {
        virtualKeyboard.classList.remove('hidden');
    }

    document.addEventListener('focusin', (e) => {
        if (e.target.matches('input[type="text"], input[type="email"], input[type="tel"], textarea')) {
            activeInput = e.target;
        }
    });

    keys.forEach(key => {
        key.addEventListener('click', () => {
            if (!activeInput) {
                showToast('Please click on an input field first');
                return;
            }

            const keyValue = key.getAttribute('data-key');
            
            if (keyValue === 'Backspace') {
                const start = activeInput.selectionStart;
                const end = activeInput.selectionEnd;
                
                if (start === end && start > 0) {
                    activeInput.value = activeInput.value.slice(0, start - 1) + activeInput.value.slice(start);
                    activeInput.setSelectionRange(start - 1, start - 1);
                } else if (start !== end) {
                    activeInput.value = activeInput.value.slice(0, start) + activeInput.value.slice(end);
                    activeInput.setSelectionRange(start, start);
                }
            } else if (keyValue === 'CapsLock') {
                capsLockActive = !capsLockActive;
                key.classList.toggle('active', capsLockActive);
                announce(capsLockActive ? 'Caps lock on' : 'Caps lock off');
            } else if (keyValue === 'Shift') {
                shiftActive = !shiftActive;
                key.classList.toggle('active', shiftActive);
            } else {
                let char = keyValue;
                
                if ((capsLockActive || shiftActive) && char.length === 1) {
                    char = char.toUpperCase();
                } else if (char.length === 1) {
                    char = char.toLowerCase();
                }
                
                const start = activeInput.selectionStart;
                const end = activeInput.selectionEnd;
                
                activeInput.value = activeInput.value.slice(0, start) + char + activeInput.value.slice(end);
                activeInput.setSelectionRange(start + char.length, start + char.length);
                
                if (shiftActive) {
                    shiftActive = false;
                    document.querySelector('.key-shift').classList.remove('active');
                }
            }
            
            activeInput.dispatchEvent(new Event('input', { bubbles: true }));
            activeInput.focus();
        });
    });

    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 3) {
                value = `(${value}`;
            } else if (value.length <= 6) {
                value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
            } else {
                value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
            }
        }
        e.target.value = value;
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === '?' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            showHelpDialog();
        }
        
        if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
            e.preventDefault();
            updateRootFontSize(currentHtmlFontSize + 2);
            showToast('Font size increased');
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === '-') {
            e.preventDefault();
            updateRootFontSize(currentHtmlFontSize - 2);
            showToast('Font size decreased');
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            document.body.classList.toggle('high-contrast');
            const isHighContrast = document.body.classList.contains('high-contrast');
            localStorage.setItem('highContrast', isHighContrast);
            showToast(isHighContrast ? 'High contrast enabled' : 'High contrast disabled');
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveProgress(true);
        }
        
        if (!e.target.matches('input, textarea')) {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (currentQuestionIndex > 0) {
                    scrollToQuestion(currentQuestionIndex - 1);
                }
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (currentQuestionIndex < totalQuestions - 1) {
                    scrollToQuestion(currentQuestionIndex + 1);
                }
            }
        }

        if (e.key === 'Escape') {
            if (messageBoxOverlay.style.display === 'flex') closeMessageBox();
            if (confirmOverlay.style.display === 'flex') closeConfirmDialog();
            if (helpOverlay.style.display === 'flex') closeHelpDialog();
        }
    });

    // Text-to-speech
    const speakButtons = document.querySelectorAll('.speak-button');
    const synth = window.speechSynthesis;

    speakButtons.forEach(button => {
        button.addEventListener('click', () => {
            const questionBlock = button.closest('.question-block');
            if (!questionBlock) return;

            const headerElement = questionBlock.querySelector('label, legend');
            let textToSpeak = '';

            if (headerElement) {
                const clone = headerElement.cloneNode(true);
                clone.querySelector('.speak-button')?.remove();
                clone.querySelector('.mr-2')?.remove();
                clone.querySelector('.text-red-600')?.remove();
                clone.querySelector('.completion-indicator')?.remove();
                textToSpeak = clone.textContent.trim();
            }

            if (synth.speaking) synth.cancel();
            
            if (textToSpeak) {
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.lang = "en-US";
                synth.speak(utterance);
            }
        });
    });

    // Help Dialog
    const helpButton = document.getElementById('help-button');
    const helpOverlay = document.getElementById('help-overlay');
    const helpClose = document.getElementById('help-close');

    function showHelpDialog() {
        helpOverlay.style.display = 'flex';
        setTimeout(() => helpClose.focus(), 100);
    }

    function closeHelpDialog() {
        helpOverlay.style.display = 'none';
    }

    helpButton.addEventListener('click', showHelpDialog);
    helpClose.addEventListener('click', closeHelpDialog);
    helpClose.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            closeHelpDialog();
        }
    });
    helpOverlay.addEventListener('click', (e) => {
        if (e.target === helpOverlay) closeHelpDialog();
    });

    // Message Box
    const messageBoxOverlay = document.getElementById('message-box-overlay');
    const messageBoxText = document.getElementById('message-box-text');
    const messageBoxClose = document.getElementById('message-box-close');

    function showMessageBox(message) {
        messageBoxText.textContent = message;
        messageBoxOverlay.style.display = 'flex';
        messageBoxText.setAttribute('role', 'alert');
        setTimeout(() => messageBoxClose.focus(), 100);
        announce(message);
    }

    function closeMessageBox() {
        messageBoxOverlay.style.display = 'none';
        messageBoxText.removeAttribute('role');
    }

    messageBoxClose.addEventListener('click', closeMessageBox);
    messageBoxClose.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            closeMessageBox();
        }
    });
    messageBoxOverlay.addEventListener('click', (e) => {
        if (e.target === messageBoxOverlay) closeMessageBox();
    });

    // Confirmation Dialog
    const confirmOverlay = document.getElementById('confirm-overlay');
    const confirmText = document.getElementById('confirm-text');
    const confirmOk = document.getElementById('confirm-ok');
    const confirmCancel = document.getElementById('confirm-cancel');
    let confirmCallback = null;

    function showConfirmDialog(message, onConfirm) {
        confirmText.textContent = message;
        confirmCallback = onConfirm;
        confirmOverlay.style.display = 'flex';
        setTimeout(() => confirmCancel.focus(), 100);
    }

    function closeConfirmDialog() {
        confirmOverlay.style.display = 'none';
        confirmCallback = null;
    }

    confirmOk.addEventListener('click', () => {
        if (confirmCallback) confirmCallback();
        closeConfirmDialog();
    });

    confirmCancel.addEventListener('click', closeConfirmDialog);

    // Form validation with real-time feedback
    nameInput.addEventListener('blur', () => {
        const nameError = document.getElementById('name-error');
        if (nameInput.value && nameInput.value.trim().length < 2) {
            nameError.style.display = 'block';
            nameInput.setAttribute('aria-invalid', 'true');
        } else if (nameInput.value) {
            nameError.style.display = 'none';
            nameInput.setAttribute('aria-invalid', 'false');
        }
    });

    emailInput.addEventListener('blur', () => {
        const emailError = document.getElementById('email-error');
        if (emailInput.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
            emailError.style.display = 'block';
            emailInput.setAttribute('aria-invalid', 'true');
        } else if (emailInput.value) {
            emailError.style.display = 'none';
            emailInput.setAttribute('aria-invalid', 'false');
        }
    });

    experienceRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const experienceError = document.getElementById('experience-error');
            experienceError.style.display = 'none';
            radio.setAttribute('aria-invalid', 'false');
        });
    });

    function validateForm() {
        let isValid = true;
        
        const nameError = document.getElementById('name-error');
        if (!nameInput.value || nameInput.value.trim().length < 2) {
            nameError.style.display = 'block';
            nameInput.setAttribute('aria-invalid', 'true');
            isValid = false;
        } else {
            nameError.style.display = 'none';
            nameInput.setAttribute('aria-invalid', 'false');
        }
        
        const emailError = document.getElementById('email-error');
        if (!emailInput.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
            emailError.style.display = 'block';
            emailInput.setAttribute('aria-invalid', 'true');
            isValid = false;
        } else {
            emailError.style.display = 'none';
            emailInput.setAttribute('aria-invalid', 'false');
        }

        const experienceError = document.getElementById('experience-error');
        const checkedExperience = document.querySelector('input[name="experience"]:checked');
        if (!checkedExperience) {
            experienceError.style.display = 'block';
            experienceRadios[0].setAttribute('aria-invalid', 'true');
            isValid = false;
        } else {
            experienceError.style.display = 'none';
            experienceRadios[0].setAttribute('aria-invalid', 'false');
        }

        return isValid;
    }

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = validateForm();
        
        if (isValid) {
            const submitBtn = form.querySelector('button[type="submit"]');
            const submitText = document.getElementById('submit-text');
            const submitLoader = document.getElementById('submit-loader');
            
            submitBtn.disabled = true;
            submitText.classList.add('hidden');
            submitLoader.classList.remove('hidden');
            announce('Submitting form');
            
            setTimeout(() => {
                submitBtn.disabled = false;
                submitText.classList.remove('hidden');
                submitLoader.classList.add('hidden');
                
                showMessageBox("Form submitted successfully! Thank you for your feedback.");
                localStorage.removeItem('formProgress');
                updateAutosaveIndicator('submitted');
                updateCompletion();
            }, 1500);
        } else {
            showMessageBox("Please correct the errors on the form.");
        }
    });

    // Navigation
    const questions = document.querySelectorAll('.question-block');
    const navUpBtn = document.getElementById('nav-up');
    const navDownBtn = document.getElementById('nav-down');
    const navCounter = document.getElementById('nav-counter');
    const progressBar = document.getElementById('progress-bar');
    const completionPercentage = document.getElementById('completion-percentage');
    let currentQuestionIndex = 0;
    const totalQuestions = questions.length;

    function updateNav(index) {
        currentQuestionIndex = index;
        navCounter.textContent = `Question ${index + 1} / ${totalQuestions}`;
        
        navUpBtn.disabled = (index === 0);
        navDownBtn.disabled = (index === totalQuestions - 1);
        
        const progressPercent = ((index + 1) / totalQuestions) * 100;
        progressBar.style.width = `${progressPercent}%`;
        
        questions.forEach((q, i) => {
            q.classList.toggle('active', i === index);
        });
    }

    function scrollToQuestion(index, smooth = true) {
        if (questions[index]) {
            const behavior = (smooth && !reducedMotion) ? 'smooth' : 'auto';
            questions[index].scrollIntoView({ behavior, block: 'center' });
            
            const firstInput = questions[index].querySelector('input, textarea');
            if (firstInput) firstInput.focus();
            
            updateNav(index);
            announce(`Question ${index + 1} of ${totalQuestions}`);
        }
    }

    navUpBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            scrollToQuestion(currentQuestionIndex - 1);
        }
    });

    navDownBtn.addEventListener('click', () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            scrollToQuestion(currentQuestionIndex + 1);
        }
    });

    questions.forEach((q, index) => {
        q.addEventListener('focusin', () => {
            updateNav(index);
        });
    });

    // Toast messages
    const toastMessage = document.getElementById('toast-message');
    const toastText = document.getElementById('toast-text');
    let toastTimeout;

    function showToast(message) {
        if (toastText) toastText.textContent = message;
        toastMessage.classList.add('show');
        
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toastMessage.classList.remove('show');
        }, 2000);
    }

    // Character counter
    const charCounter = document.getElementById('char-counter');
    feedbackInput.addEventListener('input', () => {
        const count = feedbackInput.value.length;
        charCounter.textContent = `${count} / 500 characters`;
        if (count >= 450) {
            charCounter.classList.add('char-warning');
        } else {
            charCounter.classList.remove('char-warning');
        }
    });

    // Completion tracking
    function updateCompletion() {
        const completionIndicators = document.querySelectorAll('.completion-indicator');
        let completedCount = 0;
        const requiredFields = 3; // name, email, experience
        
        // Check name
        if (nameInput.value.trim()) {
            completionIndicators[0].textContent = '✓';
            completionIndicators[0].classList.add('completed');
            completedCount++;
        } else {
            completionIndicators[0].textContent = '○';
            completionIndicators[0].classList.remove('completed');
        }
        
        // Check email
        if (emailInput.value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
            completionIndicators[1].textContent = '✓';
            completionIndicators[1].classList.add('completed');
            completedCount++;
        } else {
            completionIndicators[1].textContent = '○';
            completionIndicators[1].classList.remove('completed');
        }
        
        // Check phone (optional but track if filled)
        if (phoneInput.value.trim()) {
            completionIndicators[2].textContent = '✓';
            completionIndicators[2].classList.add('completed');
        } else {
            completionIndicators[2].textContent = '○';
            completionIndicators[2].classList.remove('completed');
        }
        
        // Check experience
        if (document.querySelector('input[name="experience"]:checked')) {
            completionIndicators[3].textContent = '✓';
            completionIndicators[3].classList.add('completed');
            completedCount++;
        } else {
            completionIndicators[3].textContent = '○';
            completionIndicators[3].classList.remove('completed');
        }
        
        // Check features (optional but track if any selected)
        if (document.querySelector('input[name="features"]:checked')) {
            completionIndicators[4].textContent = '✓';
            completionIndicators[4].classList.add('completed');
        } else {
            completionIndicators[4].textContent = '○';
            completionIndicators[4].classList.remove('completed');
        }
        
        // Check feedback (optional but track if filled)
        if (feedbackInput.value.trim()) {
            completionIndicators[5].textContent = '✓';
            completionIndicators[5].classList.add('completed');
        } else {
            completionIndicators[5].textContent = '○';
            completionIndicators[5].classList.remove('completed');
        }
        
        const percentage = Math.round((completedCount / requiredFields) * 100);
        completionPercentage.textContent = `${percentage}% Complete`;
    }

    // Autosave
    const autosaveIndicator = document.getElementById('autosave-indicator');
    const autosaveText = document.getElementById('autosave-text');
    let saveTimeout;
    let isUnsaved = false;

    function updateAutosaveIndicator(status) {
        if (status === 'saving') {
            autosaveText.textContent = 'Saving...';
            autosaveIndicator.classList.add('saving');
        } else if (status === 'saved') {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            autosaveText.textContent = `Saved at ${timeStr}`;
            autosaveIndicator.classList.remove('saving');
            isUnsaved = false;
        } else if (status === 'submitted') {
            autosaveText.textContent = 'Submitted';
            autosaveIndicator.classList.remove('saving');
        }
    }

    function saveProgress(manual = false) {
        const features = Array.from(document.querySelectorAll('input[name="features"]:checked'))
            .map(cb => cb.value);
            
        const data = {
            name: nameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            experience: document.querySelector('input[name="experience"]:checked')?.value || null,
            features: features,
            feedback: feedbackInput.value
        };
        
        if (!manual) updateAutosaveIndicator('saving');
        
        localStorage.setItem('formProgress', JSON.stringify(data));
        
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            updateAutosaveIndicator('saved');
            if (manual) showToast("Progress saved manually!");
        }, manual ? 100 : 800);
    }

    function loadProgress() {
        const data = JSON.parse(localStorage.getItem('formProgress'));
        let wasRestored = false;
        let activeIndex = 0;
        
        if (data) {
            nameInput.value = data.name || '';
            emailInput.value = data.email || '';
            phoneInput.value = data.phone || '';
            feedbackInput.value = data.feedback || '';
            
            if (data.name || data.email || data.feedback) wasRestored = true;
            
            if (data.experience) {
                const radioToCheck = document.querySelector(`input[name="experience"][value="${data.experience}"]`);
                if (radioToCheck) {
                    radioToCheck.checked = true;
                    wasRestored = true;
                }
            }
            
            if (data.features && data.features.length > 0) {
                data.features.forEach(value => {
                    const checkbox = document.querySelector(`input[name="features"][value="${value}"]`);
                    if (checkbox) checkbox.checked = true;
                });
                wasRestored = true;
            }
            
            // Determine active question
            if (data.feedback) {
                activeIndex = 5;
            } else if (data.features && data.features.length > 0) {
                activeIndex = 4;
            } else if (data.experience) {
                activeIndex = 3;
            } else if (data.phone) {
                activeIndex = 2;
            } else if (data.email) {
                activeIndex = 1;
            } else if (data.name) {
                activeIndex = 0;
            }

            feedbackInput.dispatchEvent(new Event('input'));
        }
        
        if (wasRestored) {
            showToast("Progress restored!");
            updateAutosaveIndicator('saved');
        }
        
        return activeIndex;
    }

    form.addEventListener('input', () => {
        isUnsaved = true;
        saveProgress();
        updateCompletion();
    });
    
    const startingIndex = loadProgress();

    // Clear button
    const clearButton = document.getElementById('clear-button');
    clearButton.addEventListener('click', () => {
        showConfirmDialog('Are you sure you want to clear all form data?', () => {
            nameInput.value = '';
            emailInput.value = '';
            phoneInput.value = '';
            feedbackInput.value = '';
            experienceRadios.forEach(radio => radio.checked = false);
            featureCheckboxes.forEach(cb => cb.checked = false);
            
            document.getElementById('name-error').style.display = 'none';
            document.getElementById('email-error').style.display = 'none';
            document.getElementById('experience-error').style.display = 'none';
            
            localStorage.removeItem('formProgress');
            scrollToQuestion(0, true);
            showToast("Form cleared!");
            feedbackInput.dispatchEvent(new Event('input'));
            updateAutosaveIndicator('saved');
            //hide confirm box
            document.getElementById('confirm-overlay').style.display = 'none';
            updateCompletion();
        });
    });

    // Warn before leaving
    window.addEventListener('beforeunload', (e) => {
        if (isUnsaved && (nameInput.value || emailInput.value || feedbackInput.value)) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    // Initialize
    if (startingIndex > 0) {
        if (questions[startingIndex]) {
            questions[startingIndex].scrollIntoView({ behavior: 'auto', block: 'center' });
            const firstInput = questions[startingIndex].querySelector('input, textarea');
            if (firstInput) firstInput.focus();
            updateNav(startingIndex);
        }
    } else {
        updateNav(0);
    }

    updateCompletion();
});
