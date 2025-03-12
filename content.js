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

        // Click navigation buttons
        this.clickNavigationButtons();

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
        let fullyCorrectCount = 0; // Track fully correct answers

        // Refresh solutions before calculating score
        this.findSolutions();

        this.solutions.forEach(solution => {
            const solutionText = solution.textContent;
            // Match both "Correct is" and "Correct Answers:" formats
            const correctMatch = solutionText.match(/Correct (?:is|Answers:) ([A-D,\s]+)\.?/i);

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

                    // Count the total number of options for this question
                    const totalOptions = questionElement.querySelectorAll('input[type="checkbox"]').length;

                    // Fix for when all options are correct (avoid division by zero)
                    let score;
                    if (correctOptions.length === totalOptions) {
                        // When all options are correct, just check if user selected all options
                        score = (correctCount === totalOptions && incorrectCount === 0) ? 1 : 0;
                    } else {
                        // Original formula but using dynamic total options count
                        score = Math.max(0, (correctCount / correctOptions.length) - (incorrectCount / (totalOptions - correctOptions.length)));
                    }

                    correctAnswers += score;

                    // Increment fully correct count if score is 1 (100%)
                    if (score === 1) {
                        fullyCorrectCount++;
                    }

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

        // Get the page title for sharing
        const pageTitle = document.title || 'Secureum Race';

        // Remove existing final score if present
        const existingFinalScore = document.querySelector('.final-score-container');
        if (existingFinalScore) {
            existingFinalScore.remove();
        }

        // Create final score popup
        const finalScoreContainer = document.createElement('div');
        finalScoreContainer.className = 'final-score-container';

        // Style the container
        finalScoreContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 999999;
            padding: 24px 30px;
            border-radius: 12px;
            background: linear-gradient(45deg, #4776E6, #8E54E9);
            color: white;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            font-family: system-ui, -apple-system, sans-serif;
            backdrop-filter: blur(5px);
            transition: all 0.3s ease;
            max-width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            text-align: center;
            display: block;
        `;

        // Create the content container first
        const contentContainer = document.createElement('div');
        contentContainer.innerHTML = `
            <div style="font-size: 24px; font-weight: 700; margin-bottom: 4px;">Score: ${finalScore}%</div>
            <div style="font-size: 14px; opacity: 0.9;">Correct: ${fullyCorrectCount}/${totalQuestions} questions</div>
            <div style="font-size: 14px; opacity: 0.9;">Completed in ${completionTime}</div>
            <div style="margin-top: 12px; display: flex; justify-content: center; align-items: center; flex-direction: column; gap: 10px;">
                <button id="generate-image-btn" style="display: flex; align-items: center; background: #1DA1F2; color: white; text-decoration: none; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; transition: all 0.2s ease; border: none; cursor: pointer;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 6px;">
                        <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                    </svg>
                    Share Results
                </button>
                <div id="image-preview" style="display: none; margin-top: 10px; width: 100%;"></div>
            </div>
            <div style="margin-top: 8px; font-size: 12px; opacity: 0.8;">
                Powered by <a href="https://kupia.io" target="_blank" style="color: white; text-decoration: none; font-weight: 600;">kupia.io ↗</a>
            </div>
        `;

        // Create close button
        const closeButton = document.createElement('div');
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.width = '24px';
        closeButton.style.height = '24px';
        closeButton.style.borderRadius = '50%';
        closeButton.style.background = 'rgba(255, 255, 255, 0.2)';
        closeButton.style.display = 'flex';
        closeButton.style.alignItems = 'center';
        closeButton.style.justifyContent = 'center';
        closeButton.style.cursor = 'pointer';
        closeButton.style.transition = 'all 0.2s ease';
        closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.background = 'rgba(255, 255, 255, 0.3)';
        });

        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.background = 'rgba(255, 255, 255, 0.2)';
        });

        closeButton.addEventListener('click', () => {
            finalScoreContainer.remove();
        });

        // Add hover effects to container
        finalScoreContainer.addEventListener('mouseenter', () => {
            finalScoreContainer.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.25)';
        });

        finalScoreContainer.addEventListener('mouseleave', () => {
            finalScoreContainer.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        });

        // Append elements in the correct order
        finalScoreContainer.appendChild(closeButton);
        finalScoreContainer.appendChild(contentContainer);
        document.body.appendChild(finalScoreContainer);

        // Check and adjust position after adding to DOM
        const checkAndAdjustScorePosition = () => {
            setTimeout(() => {
                const rect = finalScoreContainer.getBoundingClientRect();
                const viewportHeight = window.innerHeight;

                // If popup is taller than viewport, position at top with some padding
                if (rect.height > viewportHeight * 0.9) {
                    finalScoreContainer.style.top = '5vh';
                    finalScoreContainer.style.transform = 'translateX(-50%)';
                    finalScoreContainer.style.maxHeight = '90vh';
                }
            }, 10);
        };

        checkAndAdjustScorePosition();

        // Add event listener to generate image button
        document.getElementById('generate-image-btn').addEventListener('click', () => {
            // Close the original popup when generating the image
            finalScoreContainer.remove();
            this.generateResultImage(pageTitle, finalScore, fullyCorrectCount, totalQuestions, completionTime);
        });
    }

    uploadToImgBB(dataUrl, callback) {
        // Remove the data:image/png;base64, part
        const base64Image = dataUrl.split(',')[1];

        // ImgBB API key - this should be replaced with the actual key
        const apiKey = '251658d04c922c72e5b1134c94365ec0'; // Replace with actual key

        // Create form data
        const formData = new FormData();
        formData.append('image', base64Image);

        // Make API request
        fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let directImageUrl = '';
                let viewerUrl = '';

                // Get the viewer URL for sharing on social media
                if (data.data.url_viewer) {
                    viewerUrl = data.data.url_viewer;
                }

                // Get the direct image URL for other purposes
                if (data.data.image && data.data.image.url) {
                    directImageUrl = data.data.image.url;
                } else if (data.data.url) {
                    directImageUrl = data.data.url;
                } else if (data.data.display_url) {
                    directImageUrl = data.data.display_url;
                }

                callback(true, {
                    url: directImageUrl,  // The direct image URL
                    url_viewer: viewerUrl, // The viewer URL for sharing
                    delete_url: data.data.delete_url
                });
            } else {
                callback(false, null);
            }
        })
        .catch(error => {
            callback(false, null);
        });
    }

    generateResultImage(pageTitle, finalScore, fullyCorrectCount, totalQuestions, completionTime) {
        // Create canvas for image generation
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');

        // Create background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#6c5ce7');
        gradient.addColorStop(1, '#a29bfe');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add some design elements - subtle patterns
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = 50 + Math.random() * 300;
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Add a subtle overlay pattern
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for (let x = 0; x < canvas.width; x += 20) {
            for (let y = 0; y < canvas.height; y += 20) {
                if (Math.random() > 0.5) {
                    ctx.fillRect(x, y, 10, 10);
                }
            }
        }

        // Set text styles - use more elegant font stack
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';

        // Draw title with better text wrapping
        const maxWidth = canvas.width - 100;
        const wrapText = (text, x, y, maxWidth, lineHeight) => {
            const words = text.split(' ');
            let line = '';
            let lines = [];

            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;

                if (testWidth > maxWidth && n > 0) {
                    lines.push(line);
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line);

            // Return if too many lines
            if (lines.length > 2) {
                lines = lines.slice(0, 2);
                lines[1] = lines[1].substring(0, lines[1].length - 4) + '...';
            }

            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], x, y + (i * lineHeight));
            }

            return lines.length;
        };

        // Draw title with elegant font
        ctx.font = '600 36px "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        const titleLines = wrapText(pageTitle, canvas.width / 2, 100, maxWidth, 50);

        // Adjust vertical positions based on title lines
        const titleOffset = (titleLines - 1) * 30;

        // Draw score with a background circle
        const scoreY = 230 + titleOffset;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, scoreY - 20, 120, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fill();

        ctx.font = '700 120px "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        ctx.fillStyle = 'white';
        ctx.fillText(`${finalScore}%`, canvas.width / 2, scoreY);

        // Draw correct answers with improved styling
        ctx.font = '600 46px "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        ctx.fillText(`${fullyCorrectCount}/${totalQuestions} Correct Answers`, canvas.width / 2, scoreY + 100);

        // Draw completion time with icon
        ctx.font = '500 36px "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        ctx.fillText(`Completed in ${completionTime}`, canvas.width / 2, scoreY + 170);

        // Add a divider line
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 150, scoreY + 210);
        ctx.lineTo(canvas.width / 2 + 150, scoreY + 210);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Secureum Race Runner text with improved styling
        ctx.font = '600 30px "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        ctx.fillText('Secureum Race Runner', canvas.width / 2, scoreY + 260);

        // Draw kupia.io text with logo styling
        ctx.font = '500 24px "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        ctx.fillText('Powered by kupia.io', canvas.width / 2, scoreY + 300);

        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/png');

        // Create a new popup for the share options
        const sharePopup = document.createElement('div');
        sharePopup.className = 'share-popup';
        sharePopup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 999999;
            padding: 24px 30px;
            border-radius: 12px;
            background: linear-gradient(45deg, #4776E6, #8E54E9);
            color: white;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            font-family: system-ui, -apple-system, sans-serif;
            backdrop-filter: blur(5px);
            transition: all 0.3s ease;
            width: 350px;
            max-width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            text-align: center;
            display: block;
        `;

        // Show loading state with the generated image clearly visible
        sharePopup.innerHTML = `
            <div style="text-align: center; padding: 10px; margin: 0 auto; max-width: 320px;">
                <div style="margin-bottom: 8px; font-weight: 500;">Uploading image...</div>
                <img src="${dataUrl}" style="width: 100%; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
                <div style="display: flex; justify-content: center; margin-top: 10px;">
                    <div style="display: inline-block; width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #1DA1F2; animation: spin 1s linear infinite;"></div>
                </div>
                <style>
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                </style>
            </div>
        `;

        // Add close button to share popup
        const closeButton = document.createElement('div');
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.width = '24px';
        closeButton.style.height = '24px';
        closeButton.style.borderRadius = '50%';
        closeButton.style.background = 'rgba(255, 255, 255, 0.2)';
        closeButton.style.display = 'flex';
        closeButton.style.alignItems = 'center';
        closeButton.style.justifyContent = 'center';
        closeButton.style.cursor = 'pointer';
        closeButton.style.transition = 'all 0.2s ease';
        closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.background = 'rgba(255, 255, 255, 0.3)';
        });

        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.background = 'rgba(255, 255, 255, 0.2)';
        });

        closeButton.addEventListener('click', () => {
            sharePopup.remove();
        });

        sharePopup.appendChild(closeButton);
        document.body.appendChild(sharePopup);

        // Check and adjust position after adding to DOM
        const checkAndAdjustSharePosition = () => {
            setTimeout(() => {
                const rect = sharePopup.getBoundingClientRect();
                const viewportHeight = window.innerHeight;

                // If popup is taller than viewport, position at top with some padding
                if (rect.height > viewportHeight * 0.9) {
                    sharePopup.style.top = '5vh';
                    sharePopup.style.transform = 'translateX(-50%)';
                    sharePopup.style.maxHeight = '90vh';
                }
            }, 10);
        };

        checkAndAdjustSharePosition();

        // Upload to ImgBB
        this.uploadToImgBB(dataUrl, (success, result) => {
            if (success) {
                // Use the ImgBB sharing URL instead of the kupia.io URL
                const tweetText = `Just completed a race of @TheSecureum using @KupiaSecurity's Secureum Race Runner! Score: ${finalScore}% (${fullyCorrectCount}/${totalQuestions} correct)! ${result.url_viewer}`;
                const shareText = encodeURIComponent(tweetText);

                sharePopup.innerHTML = `
                    <div style="text-align: center; margin: 0 auto; max-width: 350px;">
                        <img src="${dataUrl}" style="width: 100%; max-width: 300px; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <a href="${dataUrl}" download="secureum-race-result.png" style="background: #2ecc71; color: white; text-decoration: none; padding: 8px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; text-align: center; display: flex; align-items: center; justify-content: center;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 8px;">
                                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                                </svg>
                                Download Image
                            </a>
                            <a href="https://twitter.com/intent/tweet?text=${shareText}" target="_blank" style="background: #1DA1F2; color: white; text-decoration: none; padding: 8px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; text-align: center; display: flex; align-items: center; justify-content: center;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 8px;">
                                    <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                                </svg>
                                Share on X
                            </a>
                        </div>
                        <div style="margin-top: 12px; font-size: 13px; opacity: 0.9; text-align: center;">
                            For best results: Download image and manually attach to your tweet
                        </div>
                    </div>
                `;
                sharePopup.appendChild(closeButton);
            } else {
                // Fallback to download only if upload fails
                sharePopup.innerHTML = `
                    <div style="text-align: center; margin: 0 auto; max-width: 350px;">
                        <img src="${dataUrl}" style="width: 100%; max-width: 300px; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
                        <div style="margin-bottom: 10px; color: #ff4757;">Image upload failed. You can still download and share manually.</div>
                        <div style="display: flex; justify-content: center;">
                            <a href="${dataUrl}" download="secureum-race-result.png" style="background: #2ecc71; color: white; text-decoration: none; padding: 8px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; text-align: center; display: flex; align-items: center; justify-content: center;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 8px;">
                                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                                </svg>
                                Download Image
                            </a>
                        </div>
                    </div>
                `;
                sharePopup.appendChild(closeButton);
            }
        });
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }

    // Get the total number of options for a question
    getTotalOptionsCount(questionElement) {
        // Count the number of checkboxes in the question element
        const checkboxes = questionElement.querySelectorAll('input[type="checkbox"]');
        return checkboxes.length;
    }

    clickNavigationButtons() {
        // Wait for the page to fully load
        setTimeout(() => {
            // Try to find and click the buttons in order
            const buttonSelectors = [
                'button:has-text("Ethereum/EVM")',
                'button:has-text("Secureum Bootcamp")',
                'button:has-text("Epoch ∞")'
            ];

            // Function to find button by text
            const findButtonByText = (text) => {
                // Try different methods to find the button
                let button = null;

                // Method 1: Using querySelector with attribute contains
                const buttons = document.querySelectorAll('button');
                for (const btn of buttons) {
                    if (btn.textContent.trim() === text) {
                        button = btn;
                        break;
                    }
                }

                // Method 2: Using XPath if Method 1 fails
                if (!button) {
                    const xpath = `//button[text()="${text}"]`;
                    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                    button = result.singleNodeValue;
                }

                return button;
            };

            // Click buttons in sequence with delays
            const clickSequentially = (index) => {
                if (index >= buttonSelectors.length) return;

                const buttonText = buttonSelectors[index].replace('button:has-text("', '').replace('")', '');
                const button = findButtonByText(buttonText);

                if (button) {
                    button.click();

                    // Wait before clicking the next button
                    setTimeout(() => {
                        clickSequentially(index + 1);
                    }, 500);
                } else {
                    // Try the next button anyway
                    setTimeout(() => {
                        clickSequentially(index + 1);
                    }, 500);
                }
            };

            // Start clicking buttons
            clickSequentially(0);
        }, 2000); // Wait 2 seconds for the page to load
    }
}

// Initialize the extension when the page is loaded
window.addEventListener('load', () => {
    new SecureumRace();
});


