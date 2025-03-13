// ✅ Page Navigation Functions (Now Globally Available)
function nextPage1() {
    window.location.href = "/Website/quiz2.html";
}
function nextPage2() {
    window.location.href = "/Website/quiz3.html";
}
function nextPage3() {
    window.location.href = "/Website/sectors.html";
}
function goBack() {
    window.history.back();
}

document.addEventListener("DOMContentLoaded", function () {
    // ✅ Mobile Menu Toggle
    const menu = document.querySelector("#mobile-menu");
    const menuLinks = document.querySelector(".navbar__menu");

    if (menu && menuLinks) {
        menu.addEventListener("click", function () {
            menu.classList.toggle("is-active");
            menuLinks.classList.toggle("active");
        });
    }

    // ✅ Quiz Responses Storage
    let responses = JSON.parse(localStorage.getItem("quizResponses")) || {};

    function saveResponse(question, value) {
        responses[question] = value;
        localStorage.setItem("quizResponses", JSON.stringify(responses));
    }

    function loadPreviousSelection() {
        document.querySelectorAll(".circle").forEach(circle => {
            let question = circle.dataset.question;
            let value = circle.dataset.value;
            
            if (responses[question] === value) {
                // ✅ Remove any existing selections for the question
                document.querySelectorAll(`.circle[data-question="${question}"]`).forEach(c => c.classList.remove("selected-strongly-disagree", "selected-disagree", "selected-neutral", "selected-agree", "selected-strongly-agree"));
                
                // ✅ Apply the correct selected class
                circle.classList.add(`selected-${value}`);
            }
        });
    }

    // ✅ Enable Next Question Logic
    function enableNextQuestion() {
        const quizzes = document.querySelectorAll(".quiz");

        quizzes.forEach((quiz, index) => {
            if (index < quizzes.length - 1) {
                const nextQuiz = quizzes[index + 1];

                // ✅ Ensure next question starts disabled
                if (nextQuiz.querySelectorAll(".circle").length == 5) {
                    nextQuiz.classList.add("disabled");
                    nextQuiz.style.pointerEvents = "none";
                    nextQuiz.style.opacity = "0.5";
                } else {
                    nextQuiz.classList.remove("disabled");
                    nextQuiz.style.opacity = "1";
                }
                quiz.querySelectorAll(".circle").forEach(circle => {
                    circle.addEventListener("click", () => {
                        let question = circle.dataset.question;
                        let value = circle.dataset.value;

                        // ✅ Remove previous selection
                        quiz.querySelectorAll(".circle").forEach(c => c.classList.remove("selected-strongly-disagree", "selected-disagree", "selected-neutral", "selected-agree", "selected-strongly-agree"));

                        // ✅ Add selection class
                        circle.classList.add(`selected-${value}`);

                        // ✅ Enable the next question
                        nextQuiz.classList.remove("disabled");
                        nextQuiz.style.pointerEvents = "auto";
                        nextQuiz.style.opacity = "1";
                    });
                });
            }
        });
    }

    function enableSelected() {
        document.querySelectorAll(".quiz.disabled").forEach((quiz, index) => {
            quiz.querySelectorAll(".circle").forEach((circle,index) => {
                
                if(circle.classList.length > 1) {
                    console.log(circle.classList);
                    quiz.classList.remove("disabled");
                    quiz.style.pointerEvents = "auto";
                    quiz.style.opacity = "1";

                    return;
                }                
            });
        });
    }

    document.querySelectorAll(".circle").forEach(circle => {
        circle.addEventListener("click", () => {
            let question = circle.dataset.question;
            let value = circle.dataset.value;

            // ✅ Remove previous selection for the same question
            document.querySelectorAll(`.circle[data-question="${question}"]`).forEach(c => c.classList.remove("selected-strongly-disagree", "selected-disagree", "selected-neutral", "selected-agree", "selected-strongly-agree"));

            // ✅ Add selected class based on value
            circle.classList.add(`selected-${value}`);

            // ✅ Save response persistently
            saveResponse(question, value);
        });
    });

    loadPreviousSelection();
    enableNextQuestion();
    enableSelected();
});



    // ✅ Next Page Button Fix
    const nextButtons = document.querySelectorAll(".next-btn");
    nextButtons.forEach(button => {
        button.addEventListener("click", function () {
            let nextPage = button.getAttribute("data-next");
            if (nextPage) {
                window.location.href = nextPage;
            }
        });
    });

    const backButton = document.querySelector(".back-btn");
    if (backButton) {
        backButton.addEventListener("click", goBack);
    }

// ✅ SECTORS WHEEL (Fixed Version)
document.addEventListener("DOMContentLoaded", function () {
    const sectors = [
        "Basic Materials", "Consumer Discretionary", "Consumer Staples", "Energy",
        "Finance", "Healthcare", "Industrials", "Real Estate",
        "Technology", "Telecommunications", "Utilities"
    ];

    const container = document.querySelector(".wheel-container");
    if (!container) return; // ✅ Avoid errors if this page doesn't have a sector wheel

    const totalSectors = sectors.length;
    const angleStep = 360 / totalSectors;

    // ✅ Retrieve selection state (Boolean storage)
    let sectorSelection = JSON.parse(localStorage.getItem("sectorSelection")) || {};

    // ✅ Ensure all sectors exist in storage, default to 0
    sectors.forEach(sector => {
        if (!(sector in sectorSelection)) {
            sectorSelection[sector] = 0;
        }
    });

    function updateLocalStorage() {
        localStorage.setItem("sectorSelection", JSON.stringify(sectorSelection));
    }

    // ✅ Create sector slices dynamically
    sectors.forEach((sector, index) => {
        const startAngle = index * angleStep;
        const endAngle = startAngle + angleStep;

        const sectorDiv = document.createElement("div");
        sectorDiv.classList.add("sector");
        sectorDiv.style.transform = `rotate(${startAngle}deg)`;

        // ✅ Correct Sector Shape Using Clip-Path
        sectorDiv.style.clipPath = `polygon(
            50% 50%, 
            ${50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180)}%, 
            ${50 + 50 * Math.cos((endAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((endAngle - 90) * Math.PI / 180)}%
        )`;

        // ✅ Create label
        const textSpan = document.createElement("span");
        textSpan.textContent = sector;
        textSpan.classList.add("sector-label");

        // ✅ Position label inside sector
        const textAngle = startAngle + angleStep / 2;
        const textX = 50 + 32 * Math.cos((textAngle - 90) * Math.PI / 180);
        const textY = 50 + 32 * Math.sin((textAngle - 90) * Math.PI / 180);
        textSpan.style.left = `${textX}%`;
        textSpan.style.top = `${textY}%`;
        textSpan.style.transform = `translate(-50%, -50%) rotate(${-startAngle}deg)`;

        sectorDiv.appendChild(textSpan);
        container.appendChild(sectorDiv);

        // ✅ Restore selection state
        if (sectorSelection[sector] === 1) {
            sectorDiv.classList.add("selected");
        }

        // ✅ Click Event for Selection & Unselection
        sectorDiv.addEventListener("click", () => {
            if (sectorSelection[sector] === 1) {
                sectorSelection[sector] = 0; // Deselect
                sectorDiv.classList.remove("selected");
            } else {
                sectorSelection[sector] = 1; // Select
                sectorDiv.classList.add("selected");
            }
            updateLocalStorage();
        });

        // ✅ Hover Effect
        sectorDiv.addEventListener("mouseover", () => {
            sectorDiv.classList.add("hover");
        });

        sectorDiv.addEventListener("mouseout", () => {
            sectorDiv.classList.remove("hover");
        });
    });

    // ✅ Reset Function to Clear Selections
    function resetSelections() {
        sectors.forEach(sector => {
            sectorSelection[sector] = 0;
        });
        updateLocalStorage();
        document.querySelectorAll(".sector").forEach(sector => sector.classList.remove("selected"));
    }

    document.getElementById("reset-btn")?.addEventListener("click", resetSelections);
});


document.addEventListener("DOMContentLoaded", function () {
    // Mapping of feature to question IDs
    const featureMapping = {
        "avg_volume": ["q1", "q8", "q15"],
        "volatility": ["q2", "q9", "q16"],
        "pc_change": ["q3", "q10", "q17"],
        "trend_consistency": ["q4", "q11", "q18"],
        "avg_price": ["q5", "q12", "q19"],
        "price_momentum": ["q6", "q13", "q20"],
        "extra": ["q7", "q14", "q21"]
    };

    // Convert text responses to numeric values
    const valueMapping = {
        "strongly-disagree": 0,
        "disagree": 0.25,
        "neutral": 0.5,
        "agree": 0.75,
        "strongly-agree": 1
    };

    // Retrieve stored quiz responses
    const responses = JSON.parse(localStorage.getItem("quizResponses")) || {};

    // Function to compute the average for each feature
    function computeAverages() {
        let featureScores = {};

        // Iterate through each feature and map its questions
        for (const [feature, questions] of Object.entries(featureMapping)) {
            let values = [];

            questions.forEach(q => {
                if (responses[q]) {
                    let numericValue = valueMapping[responses[q]];
                    if (numericValue !== undefined) {
                        values.push(numericValue);
                    }
                }
            });

            // Compute the average if values exist, else assign null
            featureScores[feature] = values.length > 0 ? 
                (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : null;
        }

        return featureScores;
    }

    // Compute & Log Final Scores
    const finalScores = computeAverages();

    // Save the final scores to localStorage for further use
    localStorage.setItem("quizFinalScores", JSON.stringify(finalScores));

    // Example: Display Results on Output Page (if needed)
    if (document.getElementById("output-container")) {
        const outputContainer = document.getElementById("output-container");
        outputContainer.innerHTML = `<h2>Your Final Feature Scores</h2>`;
        
        Object.entries(finalScores).forEach(([feature, score]) => {
            outputContainer.innerHTML += `<p><strong>${feature}:</strong> ${score}</p>`;
        });
    }

    // ✅ Only run this on sectors.html
    if (window.location.pathname.includes("sectors.html")) {
        const recommendationSelect = document.getElementById("recommendations");

        if (recommendationSelect) {
            // ✅ Clear any existing options (fix in case of reloading issue)
            recommendationSelect.innerHTML = "";

            // ✅ Populate dropdown with numbers 1-10
            for (let i = 1; i <= 20; i++) {
                let option = document.createElement("option");
                option.value = i;
                option.textContent = i;
                recommendationSelect.appendChild(option);
            }

            // ✅ Load saved recommendation count
            const savedRecommendations = localStorage.getItem("recommendations");
            if (savedRecommendations) {
                recommendationSelect.value = savedRecommendations;
            }

            // ✅ Save recommendation count to localStorage on change
            recommendationSelect.addEventListener("change", function () {
                localStorage.setItem("recommendations", this.value);
            });
        }
    }

    const submitBtn = document.querySelector(".submit-btn");

    // Pachara guys new submit
    // if (submitBtn) {
    //     submitBtn.addEventListener("click", () => {
    //         // ✅ Retrieve quiz feature scores
    //         const quizFeatureScores = JSON.parse(localStorage.getItem("quizFinalScores")) || {};
    
    //         // ✅ Retrieve sector selections
    //         const sectorSelection = JSON.parse(localStorage.getItem("sectorSelection")) || {};
    
    //         // ✅ Retrieve selected time period & number of recommendations
    //         const selectedTime = localStorage.getItem("time") || "6 months";
    //         const numRecommendations = localStorage.getItem("recommendations") || "10";
    
    //         // ✅ Merge all data into a single object
    //         const finalData = {
    //             ...quizFeatureScores,  // Quiz feature scores
    //             ...sectorSelection,    // Sector selections (binary 0 or 1)
    //             selectedTimePeriod: selectedTime,  // Time period selected
    //             numberOfRecommendations: numRecommendations // Number of recommendations
    //         };
    
    //         // ✅ Save clean final data to localStorage
    //         localStorage.setItem("finalFeatureScores", JSON.stringify(finalData));
    
    //         // ✅ Debugging: Verify the final structured output
    //         console.log("Final Feature Scores After Submission:", finalData);
    
    //         // ✅ Redirect to results page
    //         window.location.href = "/Website/output.html";
    //     });
    // }
    


});

// ✅ Retrieve feature scores
const featureScores = JSON.parse(localStorage.getItem("quizFinalScores")) || {};

// ✅ Retrieve sector selections
const sectorSelections = JSON.parse(localStorage.getItem("sectorSelection")) || {};
const selectedTime = localStorage.getItem("time") || "6 months";
const numRecommendations = localStorage.getItem("recommendations") || "10";
// ✅ Merge sector selections into feature scores
const finalOutput = { ...featureScores, ...sectorSelections, selectedTimePeriod: selectedTime, numberOfRecommendations: numRecommendations };

// ✅ Save the merged output back to localStorage (so it's available immediately after submit)
localStorage.setItem("finalFeatureScoresWithSectors", JSON.stringify(finalOutput));

console.log("Final Feature Scores with Sectors BEFORE Submit:", finalOutput); // Debugging

window.addEventListener("DOMContentLoaded", () => {
    const submitBtn = document.querySelector("#submit-btn");

    if (submitBtn) {
        submitBtn.addEventListener("click", async () => {
            const finalOutput = JSON.parse(localStorage.getItem("finalFeatureScoresWithSectors"));
            console.log("Submit clicked, Final Feature Scores:", finalOutput);

            try {
                const response = await fetch("http://127.0.0.1:5000/submit-data", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(finalOutput)
                });

                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }

                const result = await response.json();
                console.log("API Response:", result);

                localStorage.setItem("apiResultData", JSON.stringify(result.data));

                window.location.href = "/Website/output.html";
            } catch (error) {
                console.error("Error submitting data:", error);
                alert("Failed to submit. Please try again.");
            }
        });
    }
});



const options = document.querySelectorAll(".time-option");

const timeOptions = document.querySelectorAll(".time-option");
        const recommendationSelect = document.getElementById("recommendations");

        // Load saved time from localStorage
        const savedTime = localStorage.getItem("time");
        if (savedTime) {
            timeOptions.forEach(option => {
                if (option.getAttribute("data-time") === savedTime) {
                    option.classList.add("selected");
                }
            });
        }

        timeOptions.forEach(option => {
            option.addEventListener("click", function() {
                // Remove selected class from all
                timeOptions.forEach(opt => opt.classList.remove("selected"));

                // Add selected class to clicked
                this.classList.add("selected");

                // Save selection to localStorage
                localStorage.setItem("time", this.getAttribute("data-time"));
            });
        });

