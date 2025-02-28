class SecureumRace {
    constructor() {
        this.timerDuration = 16 * 60; // 16 minutes in seconds
        this.remainingTime = this.timerDuration;
        this.timerInterval = null;
        this.isRunning = false;
        this.solutions = [];
        this.userAnswers = new Set();
        this.questionResults = new Map();
        this.currentUrl = window.location.href;

        // Add arrays of ad sentences and color themes
        this.adSentences = [
            "Find vulnerabilities before hackers do.",
            "One smart contract bug away from disaster.",
            "The most expensive audit is the one you skipped.",
            "When millions are at stake, off-the-shelf security isn't enough.",
            "Safe code sleeps better at night. So do its developers.",
            "Private audits prevent public exploits.",
            "Free consultation, priceless security – we promise",
            "Free security check, no strings attached.",
            "Discover risks at no cost with Kupia.",
            "Free vulnerability assessment – decide later.",
            "No fees for first look – Kupia's guarantee.",
            "Security questions? Free answers from Kupia.",
            "Zero-cost initial review by Kupia experts.",
        ];

        this.colorThemes = [
            { gradient: "linear-gradient(45deg, #FF416C, #FF4B2B)", textColor: "white" },
            { gradient: "linear-gradient(45deg, #4776E6, #8E54E9)", textColor: "white" },
            { gradient: "linear-gradient(45deg, #11998e, #38ef7d)", textColor: "white" },
            { gradient: "linear-gradient(45deg, #f2994a, #f2c94c)", textColor: "#333" },
            { gradient: "linear-gradient(45deg, #ee0979, #ff6a00)", textColor: "white" },
            { gradient: "linear-gradient(45deg, #2980B9, #6DD5FA)", textColor: "white" },
            { gradient: "linear-gradient(45deg, #8E2DE2, #4A00E0)", textColor: "white" },
            { gradient: "linear-gradient(45deg, #00B4DB, #0083B0)", textColor: "white" },
            { gradient: "linear-gradient(45deg, #834d9b, #d04ed6)", textColor: "white" },
            { gradient: "linear-gradient(45deg, #1D976C, #93F9B9)", textColor: "#333" },
        ];

        // Track the current ad element
        this.adContainer = null;

        // Initialize the extension
        this.init();

        // Setup URL change detection
        this.setupUrlChangeDetection();

        // Show initial ad
        this.updateAdvertisement();
    }

    setupUrlChangeDetection() {
        // Create a MutationObserver to detect URL changes
        const urlObserver = new MutationObserver(() => {
            if (window.location.href !== this.currentUrl) {
                this.currentUrl = window.location.href;
                this.resetExtension();
            }
        });

        // Observe the document for changes that might indicate navigation
        urlObserver.observe(document, { subtree: true, childList: true });

        // Also listen to the popstate event for browser back/forward navigation
        window.addEventListener('popstate', () => {
            if (window.location.href !== this.currentUrl) {
                this.currentUrl = window.location.href;
                this.resetExtension();
            }
        });
    }

    resetExtension() {
        // Stop the timer if it's running
        if (this.isRunning) {
            this.stopTimer();
            this.toggleButton.classList.remove('running');
            this.playIcon.style.display = 'block';
            this.stopIcon.style.display = 'none';
            this.isRunning = false;
        }

        // Clear all results
        this.clearQuestionResults();

        // Reset timer display
        this.remainingTime = this.timerDuration;
        this.updateTimerDisplay();
        this.updateProgressRing();

        // Hide timer elements
        document.querySelector('.secureum-progress-ring').classList.add('hidden');
        this.timerDisplay.classList.add('hidden');

        // Re-find solutions on the new page
        this.findSolutions();

        // Reset user answers
        this.userAnswers.clear();

        // Setup checkbox listeners again
        this.setupCheckboxListeners();
    // Update the advertisement with a new random sentence and theme
    this.updateAdvertisement()
    }

    init() {
        // Create control panel
        const controls = document.createElement('div');
        controls.className = 'secureum-controls';

        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'secureum-button-container';

        // Create the button
        this.toggleButton = document.createElement('button');
        this.toggleButton.className = 'secureum-button';
        this.toggleButton.onclick = () => this.toggleTimer();

        // Create SVG for the play/stop icon
        const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        iconSvg.setAttribute('class', 'secureum-icon start');
        iconSvg.setAttribute('viewBox', '0 0 24 24');
        iconSvg.setAttribute('fill', 'currentColor');

        // Create the play icon path
        this.playIcon = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.playIcon.setAttribute('d', 'M8 5v14l11-7z');

        // Create the stop icon path
        this.stopIcon = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.stopIcon.setAttribute('d', 'M6 6h12v12H6z');
        this.stopIcon.style.display = 'none';
        this.stopIcon.style.fill = 'red';

        iconSvg.appendChild(this.playIcon);
        iconSvg.appendChild(this.stopIcon);
        this.toggleButton.appendChild(iconSvg);

        // Create SVG for circular progress
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'secureum-progress-ring hidden');
        svg.setAttribute('viewBox', '0 0 100 100');

        const radius = 48;
        const circumference = 2 * Math.PI * radius;

        // Background circle
        const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bgCircle.setAttribute('class', 'progress-ring-bg');
        bgCircle.setAttribute('r', radius);
        bgCircle.setAttribute('cx', '50');
        bgCircle.setAttribute('cy', '50');

        // Foreground circle
        const fgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        fgCircle.setAttribute('class', 'progress-ring-fg');
        fgCircle.setAttribute('r', radius);
        fgCircle.setAttribute('cx', '50');
        fgCircle.setAttribute('cy', '50');
        fgCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        this.progressRing = fgCircle;
        this.circumference = circumference;

        svg.appendChild(bgCircle);
        svg.appendChild(fgCircle);
        buttonContainer.appendChild(svg);
        buttonContainer.appendChild(this.toggleButton);

        // Create timer display
        this.timerDisplay = document.createElement('div');
        this.timerDisplay.className = 'secureum-timer hidden';
        this.updateTimerDisplay();

        // Add elements to control panel
        controls.appendChild(buttonContainer);
        controls.appendChild(this.timerDisplay);

        // Add control panel to page
        document.body.appendChild(controls);

        // Find and store all solution elements
        this.findSolutions();

        // Setup checkbox event listeners
        this.setupCheckboxListeners();

        // Make the entire option items clickable
        this.makeOptionsClickable();

        // Initial progress ring update
        this.updateProgressRing();
    }

    // Add a method to update the ad
    updateAdvertisement() {
        // Remove existing ad if it exists
        if (this.adContainer && this.adContainer.parentNode) {
            this.adContainer.remove()
        }

        // Get random sentence and color theme
        const randomSentence = this.adSentences[Math.floor(Math.random() * this.adSentences.length)]
        const randomTheme = this.colorThemes[Math.floor(Math.random() * this.colorThemes.length)]

        // Create the ad with the random content and theme
        this.addAdvertisement(randomSentence, randomTheme)
    }

    makeOptionsClickable() {
        // Find all checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"]')

        checkboxes.forEach(checkbox => {
            // Find the parent element (typically a label or list item)
            const parentElement = checkbox.parentElement

            if (parentElement) {
                // Make the parent element look clickable with a cursor pointer
                parentElement.style.cursor = "pointer"

                // Add click event to the parent element
                parentElement.addEventListener("click", event => {
                    // Prevent clicks on the checkbox itself from being processed twice
                    if (event.target !== checkbox) {
                        event.preventDefault()
                        // Toggle the checkbox state
                        checkbox.checked = !checkbox.checked

                        // Dispatch a change event on the checkbox to trigger any existing event handlers
                        const changeEvent = new Event("change", { bubbles: true })
                        checkbox.dispatchEvent(changeEvent)
                    }
                })
            }
        })
    }

    addAdvertisement(sentence, theme) {
        // Create the ad container
        const adContainer = document.createElement("div")
        adContainer.className = "secureum-ad"
        this.adContainer = adContainer

        // Position it fixed at the bottom left corner
        adContainer.style.position = "fixed"
        adContainer.style.bottom = "20px"
        adContainer.style.left = "20px"
        adContainer.style.zIndex = "1000"
        adContainer.style.padding = "12px 16px"
        adContainer.style.borderRadius = "12px"

        // Apply the theme's gradient
        adContainer.style.background = theme.gradient
        adContainer.style.color = theme.textColor
        adContainer.style.backgroundSize = "200% 200%"
        adContainer.style.animation = "gradientAnimation 5s ease infinite"

        // Add shadow and other styling
        adContainer.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)"
        adContainer.style.fontFamily = "system-ui, -apple-system, sans-serif"
        adContainer.style.fontSize = "14px"
        adContainer.style.fontWeight = "600"
        adContainer.style.textAlign = "center"
        adContainer.style.minWidth = "200px"
        adContainer.style.backdropFilter = "blur(5px)"
        adContainer.style.transition = "all 0.3s ease"

        // Create the ad link
        const adLink = document.createElement("a")
        adLink.href = "https://kupia.io"
        adLink.target = "_blank"
        adLink.style.textDecoration = "none"
        adLink.style.color = theme.textColor
        adLink.style.display = "block"

        // Create the ad text with the provided sentence
        adLink.innerHTML = `
            <div style="margin-bottom: 4px;">${sentence}</div>
            <div style="font-size: 12px; font-weight: 500; opacity: 0.9;">kupia.io ↗</div>
        `

        // Add hover effects
        adContainer.addEventListener("mouseenter", () => {
            adContainer.style.transform = "translateY(-3px)"
            adContainer.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.25)"
        })

        adContainer.addEventListener("mouseleave", () => {
            adContainer.style.transform = "translateY(0)"
            adContainer.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)"
        })

        // Ensure the keyframe animation for the gradient is added
        if (!document.querySelector("style#secureum-ad-animation")) {
            const styleElement = document.createElement("style")
            styleElement.id = "secureum-ad-animation"
            styleElement.textContent = `
                @keyframes gradientAnimation {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `
            document.head.appendChild(styleElement)
        }

        // Assemble the ad and add to body
        adContainer.appendChild(adLink)
        document.body.appendChild(adContainer)
    }

    updateProgressRing() {
        const progress = this.remainingTime / this.timerDuration;
        const offset = this.circumference * (1 - progress);
        this.progressRing.style.strokeDashoffset = offset;
    }

    findSolutions() {
        // Find all details elements containing solutions and ensure we have the latest
        const solutionElements = document.querySelectorAll('details.rounded-lg.bg-neutral-50');
        if (solutionElements.length === 0) {
            // If no solutions found, try again after a short delay
            setTimeout(() => this.findSolutions(), 500);
            return;
        }
        this.solutions = Array.from(solutionElements);
    }

    setupCheckboxListeners() {
        // Remove existing listeners first to prevent duplicates
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.removeEventListener('change', this.handleCheckboxChange);
        });

        // Add event listeners to all checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', this.handleCheckboxChange.bind(this));
        });
    }

    handleCheckboxChange(e) {
        const option = e.target.parentElement.textContent.trim().charAt(0);
        if (e.target.checked) {
            this.userAnswers.add(option);
        } else {
            this.userAnswers.delete(option);
        }
    }

    resetState() {
        // Reset timer
        this.remainingTime = this.timerDuration;
        this.updateTimerDisplay();
        this.updateProgressRing();

        // Reset UI elements
        document.querySelector('.secureum-progress-ring').classList.add('hidden');
        this.timerDisplay.classList.add('hidden');

        // Reset button state
        this.toggleButton.classList.remove('running');
        this.playIcon.style.display = 'block';
        this.stopIcon.style.display = 'none';

        // Reset running state
        this.isRunning = false;

        // Clear results
        this.clearQuestionResults();

        // Reset user answers
        this.userAnswers.clear();

        // Uncheck all checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    toggleTimer() {
        if (!this.isRunning) {
            // Refresh solutions before starting
            this.findSolutions();
            if (this.solutions.length === 0) {
                console.warn('No solutions found. Please wait for the page to load completely.');
                return;
            }

            // Start the timer
            this.startTimer();
            this.toggleButton.classList.add('running');
            this.playIcon.style.display = 'none';
            this.stopIcon.style.display = 'block';
            this.hideSolutions();
            // Show progress ring and timer
            document.querySelector('.secureum-progress-ring').classList.remove('hidden');
            this.timerDisplay.classList.remove('hidden');
            // Clear previous results
            this.clearQuestionResults();
            this.isRunning = true;
        } else {
            // Stop the timer
            this.stopTimer();

            // Set button state
            this.toggleButton.classList.remove('running');
            this.playIcon.style.display = 'block';
            this.stopIcon.style.display = 'none';

            // Hide timer elements
            document.querySelector('.secureum-progress-ring').classList.add('hidden');
            this.timerDisplay.classList.add('hidden');

            // Show solutions and calculate score
            this.showSolutions();
            this.calculateScore();

            // Reset internal state but keep the UI elements
            this.remainingTime = this.timerDuration;
            this.isRunning = false;
            this.userAnswers.clear();
        }
    }

    startTimer() {
        this.remainingTime = this.timerDuration;
        this.timerInterval = setInterval(() => {
            this.remainingTime--;
            this.updateTimerDisplay();
            this.updateProgressRing();

            if (this.remainingTime <= 0) {
                this.stopTimer();
                this.toggleButton.classList.remove('running');
                this.playIcon.style.display = 'block';
                this.stopIcon.style.display = 'none';
                document.querySelector('.secureum-progress-ring').classList.add('hidden');
                this.timerDisplay.classList.add('hidden');
                this.showSolutions();
                this.calculateScore();
                this.isRunning = false;
                this.userAnswers.clear();
            }
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.remainingTime / 60);
        const seconds = this.remainingTime % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    clearQuestionResults() {
        document.querySelectorAll('.question-result').forEach(el => el.remove());
        const existingFinalScore = document.querySelector('.final-score-container');
        if (existingFinalScore) {
            existingFinalScore.remove();
        }
    }

    hideSolutions() {
        this.solutions.forEach(solution => {
            // First collapse the solution by removing open and data-expanded attributes
            solution.removeAttribute('open');
            solution.removeAttribute('data-expanded');

            // Then hide it after a small delay to ensure animation completes
            setTimeout(() => {
                solution.classList.add('solution-hidden');
            }, 50);
        });
        this.clearQuestionResults();
    }

    showSolutions() {
        // Find all solution details elements with the specific class
        const solutions = document.querySelectorAll('details.rounded-lg.bg-neutral-50');
        solutions.forEach(solution => {
            solution.classList.remove('solution-hidden');

            // Find the summary element and properly trigger a click event
            const summary = solution.querySelector('summary');
            if (summary) {
                // Create and dispatch a MouseEvent to properly trigger any event listeners
                const clickEvent = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                summary.dispatchEvent(clickEvent);
            }

            // Also set the open attribute as a fallback
            solution.setAttribute('open', '');
            solution.setAttribute('data-expanded', 'true');
        });
    }

    addQuestionResult(questionElement, score, isCorrect) {
        const resultDiv = document.createElement('div');
        resultDiv.className = `question-result ${isCorrect ? 'correct' : 'wrong'}`;
        resultDiv.innerHTML = `
            ${isCorrect ? '✓' : '✗'}
            <span class="percentage">${Math.round(score * 100)}%</span>
        `;

        // Find the closest h3 by traversing up to the section and then finding the h3
        const findH3Element = (element) => {
            // First try to find in previous siblings
            let currentElement = element;
            while (currentElement) {
                if (currentElement.tagName === 'H3') {
                    return currentElement;
                }
                currentElement = currentElement.previousElementSibling;
            }

            // If not found in siblings, try finding within the parent section
            const section = element.closest('section');
            if (section) {
                const h3 = section.querySelector('h3.nx-font-semibold');
                if (h3) return h3;
            }

            return null;
        };

        const titleElement = findH3Element(questionElement);

        if (titleElement) {
            titleElement.appendChild(resultDiv);
        } else {
            // If no h3 found, append to the question element itself
            questionElement.appendChild(resultDiv);
        }
    }

    calculateScore() {
        let totalQuestions = 0;
        let correctAnswers = 0;

        // Refresh solutions before calculating score
        this.findSolutions();

        this.solutions.forEach(solution => {
            const solutionText = solution.textContent;
            const correctMatch = solutionText.match(/Correct is ([A-D,\s]+)\./i); // Made case insensitive

            if (correctMatch) {
                const correctOptions = correctMatch[1].split(',').map(opt => opt.trim());
                totalQuestions++;

                // Find the corresponding question list
                const questionElement = solution.previousElementSibling;
                if (questionElement && questionElement.tagName === 'UL') {
                    const userSelectedOptions = Array.from(questionElement.querySelectorAll('input[type="checkbox"]:checked'))
                        .map(checkbox => checkbox.parentElement.textContent.trim().charAt(0));

                    // Calculate score for this question
                    const correctCount = correctOptions.filter(opt => userSelectedOptions.includes(opt)).length;
                    const incorrectCount = userSelectedOptions.length - correctCount;
                    const score = Math.max(0, (correctCount / correctOptions.length) - (incorrectCount / (4 - correctOptions.length)));

                    correctAnswers += score;

                    // Add result indicator
                    this.addQuestionResult(questionElement, score, score === 1);
                }
            }
        });

        if (totalQuestions === 0) {
            console.warn('No questions found for scoring.');
            return;
        }

        const finalScore = Math.round((correctAnswers / totalQuestions) * 100);
        const completionTime = this.formatTime(this.timerDuration - this.remainingTime);

        // Remove existing final score if present
        const existingFinalScore = document.querySelector('.final-score-container');
        if (existingFinalScore) {
            existingFinalScore.remove();
        }

        // Create and insert final score container with floating style
        const finalScoreContainer = document.createElement('div');
        finalScoreContainer.className = 'final-score-container';

        // Apply floating styles
        finalScoreContainer.style.position = 'fixed';
        finalScoreContainer.style.bottom = '20px';
        finalScoreContainer.style.right = '20px';
        finalScoreContainer.style.zIndex = '1000';
        finalScoreContainer.style.padding = '16px 20px';
        finalScoreContainer.style.borderRadius = '12px';
        finalScoreContainer.style.background = 'linear-gradient(45deg, #4776E6, #8E54E9)';
        finalScoreContainer.style.color = 'white';
        finalScoreContainer.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        finalScoreContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        finalScoreContainer.style.backdropFilter = 'blur(5px)';
        finalScoreContainer.style.transition = 'all 0.3s ease';
        finalScoreContainer.style.minWidth = '200px';
        finalScoreContainer.style.textAlign = 'center';

        // Add hover effects
        finalScoreContainer.addEventListener('mouseenter', () => {
            finalScoreContainer.style.transform = 'translateY(-3px)';
            finalScoreContainer.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.25)';
        });

        finalScoreContainer.addEventListener('mouseleave', () => {
            finalScoreContainer.style.transform = 'translateY(0)';
            finalScoreContainer.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        });

        finalScoreContainer.innerHTML = `
            <div style="font-size: 24px; font-weight: 700; margin-bottom: 4px;">Score: ${finalScore}%</div>
            <div style="font-size: 14px; opacity: 0.9;">Completed in ${completionTime}</div>
            <div style="margin-top: 12px; font-size: 12px; opacity: 0.8;">
                Track your progress at <a href="https://kupia.io" target="_blank" style="color: white; text-decoration: none; font-weight: 600;">kupia.io ↗</a>
            </div>
        `;

        document.body.appendChild(finalScoreContainer);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }

    makeOptionsClickable() {
        // Find all checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach(checkbox => {
            // Find the parent element (typically a label or list item)
            const parentElement = checkbox.parentElement;

            if (parentElement) {
                // Make the parent element look clickable with a cursor pointer
                parentElement.style.cursor = 'pointer';

                // Add click event to the parent element
                parentElement.addEventListener('click', (event) => {
                    // Prevent clicks on the checkbox itself from being processed twice
                    if (event.target !== checkbox) {
                        event.preventDefault();
                        // Toggle the checkbox state
                        checkbox.checked = !checkbox.checked;

                        // Dispatch a change event on the checkbox to trigger any existing event handlers
                        const changeEvent = new Event('change', { bubbles: true });
                        checkbox.dispatchEvent(changeEvent);
                    }
                });
            }
        });
    }
}

// Initialize the extension when the page is loaded
window.addEventListener('load', () => {
    new SecureumRace();
});


