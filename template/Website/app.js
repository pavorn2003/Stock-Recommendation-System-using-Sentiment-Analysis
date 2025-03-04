const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.navbar__menu');

menu.addEventListener('click', function() {
  menu.classList.toggle('is-active');
  menuLinks.classList.toggle('active');
});

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
                    circle.classList.add(`selected-${value}`);
                }
            });
        }

        document.querySelectorAll('.circle').forEach(circle => {
            circle.addEventListener('click', () => {
              let question = circle.dataset.question;
              let value = circle.dataset.value;

              // Remove previous selection from all options of the same question
              document.querySelectorAll(`.circle[data-question="${question}"]`).forEach(c => c.className = 'circle');

              // Add selection class to the clicked option
              circle.classList.add(`selected-${value}`);
                saveResponse(question, value);
            });
        });

        document.querySelector(".submit-btn").addEventListener("click", () => {
            console.log("Final responses:", responses);
            localStorage.setItem("quizResponses", JSON.stringify(responses)); 
            window.location.href = "/Website/output.html"; 
        });
        
        
        function enableNextQuestion() {
          const quizzes = document.querySelectorAll(".quiz");
  
          quizzes.forEach((quiz, index) => {
              if (index < quizzes.length - 1) { // Ensure there's a next question
                  const nextQuiz = quizzes[index + 1];
  
                  // Find all circles in the current question
                  quiz.querySelectorAll(".circle").forEach(circle => {
                      circle.addEventListener("click", () => {
                          let question = circle.dataset.question;
                          let value = circle.dataset.value;
  
                          // Remove previous selection from all options in the same question
                          quiz.querySelectorAll(".circle").forEach(c => c.className = "circle");
  
                          // Add selection class to the clicked option
                          circle.classList.add(`selected-${value}`);
  
                          // Enable the next question
                          nextQuiz.classList.remove("disabled");
                      });
                  });
              }
          });
      }

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

        /* Sectors Wheel */
        document.addEventListener("DOMContentLoaded", function () {
            const sectors = [
                "Basic Materials", "Consumer Discretionary", "Consumer Staples", "Energy",
                "Finance", "Healthcare", "Industrials", "Real Estate",
                "Technology", "Telecommunications", "Utilities"
            ];
        
            const container = document.querySelector(".wheel-container");
            const totalSectors = sectors.length;
            const angleStep = 360 / totalSectors;
        
            // Retrieve selected sectors from localStorage
            let selectedSectors = JSON.parse(localStorage.getItem("selectedSectors")) || [];
        
            // Function to update localStorage
            function updateLocalStorage() {
                localStorage.setItem("selectedSectors", JSON.stringify(selectedSectors));
            }
        
            // Create sector slices dynamically
            sectors.forEach((sector, index) => {
                const startAngle = index * angleStep;
                const endAngle = startAngle + angleStep;
        
                const sectorDiv = document.createElement("div");
                sectorDiv.classList.add("sector");
                sectorDiv.style.transform = `rotate(${startAngle}deg)`;
        
                // Ensure correct sector shape using clip-path
                sectorDiv.style.clipPath = `polygon(
                    50% 50%, 
                    ${50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180)}%, 
                    ${50 + 50 * Math.cos((endAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((endAngle - 90) * Math.PI / 180)}%
                )`;
        
                // Create label
                const textSpan = document.createElement("span");
                textSpan.textContent = sector;
                textSpan.classList.add("sector-label");
        
                // Position label inside sector
                const textAngle = startAngle + angleStep / 2;
                const textX = 50 + 32 * Math.cos((textAngle - 90) * Math.PI / 180);
                const textY = 50 + 32 * Math.sin((textAngle - 90) * Math.PI / 180);
                textSpan.style.left = `${textX}%`;
                textSpan.style.top = `${textY}%`;
                textSpan.style.transform = `translate(-50%, -50%) rotate(${-startAngle}deg)`;

        
                sectorDiv.appendChild(textSpan);
                container.appendChild(sectorDiv);
        
                // Restore selection state from localStorage
                if (selectedSectors.includes(sector)) {
                    sectorDiv.classList.add("selected");
                }
        
                // Click Event for Selection & Unselection
                sectorDiv.addEventListener("click", () => {
                    if (selectedSectors.includes(sector)) {
                        selectedSectors = selectedSectors.filter(s => s !== sector); // Remove selection
                        sectorDiv.classList.remove("selected");
                    } else {
                        selectedSectors.push(sector); // Add selection
                        sectorDiv.classList.add("selected");
                    }
                    updateLocalStorage();
                });
        
                // Hover Effect to Preview Selection
                sectorDiv.addEventListener("mouseover", () => {
                    sectorDiv.classList.add("hover");
                });
        
                sectorDiv.addEventListener("mouseout", () => {
                    sectorDiv.classList.remove("hover");
                });
            });
        
            // Reset Function to Clear Selections
            function resetSelections() {
                selectedSectors = [];
                updateLocalStorage();
                document.querySelectorAll(".sector").forEach(sector => sector.classList.remove("selected"));
            }
        
            document.getElementById("reset-btn").addEventListener("click", resetSelections);
        });
    

      enableNextQuestion();
  

        loadPreviousSelection();