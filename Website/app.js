function nextPage1() {
  window.location.href = "quiz2.html";
}
function nextPage2() {
  window.location.href = "quiz3.html";
}
function nextPage3() {
  window.location.href = "sectors.html";
}
function goBack() {
  window.history.back();
}

document.addEventListener("DOMContentLoaded", function () {
  const menu = document.querySelector("#mobile-menu");
  const menuLinks = document.querySelector(".navbar__menu");

  if (menu && menuLinks) {
    menu.addEventListener("click", function () {
      menu.classList.toggle("is-active");
      menuLinks.classList.toggle("active");
    });
  }

  let responses = JSON.parse(localStorage.getItem("quizResponses")) || {};

  function saveResponse(question, value) {
    responses[question] = value;
    localStorage.setItem("quizResponses", JSON.stringify(responses));
  }

  function loadPreviousSelection() {
    document.querySelectorAll(".circle").forEach((circle) => {
      let question = circle.dataset.question;
      let value = circle.dataset.value;

      if (responses[question] === value) {
        document
          .querySelectorAll(`.circle[data-question="${question}"]`)
          .forEach((c) =>
            c.classList.remove(
              "selected-strongly-disagree",
              "selected-disagree",
              "selected-neutral",
              "selected-agree",
              "selected-strongly-agree"
            )
          );

        circle.classList.add(`selected-${value}`);
      }
    });
  }

  function enableNextQuestion() {
    const quizzes = document.querySelectorAll(".quiz");

    quizzes.forEach((quiz, index) => {
      if (index < quizzes.length - 1) {
        const nextQuiz = quizzes[index + 1];

        if (nextQuiz.querySelectorAll(".circle").length == 5) {
          nextQuiz.classList.add("disabled");
          nextQuiz.style.pointerEvents = "none";
          nextQuiz.style.opacity = "0.5";
        } else {
          nextQuiz.classList.remove("disabled");
          nextQuiz.style.opacity = "1";
        }
        quiz.querySelectorAll(".circle").forEach((circle) => {
          circle.addEventListener("click", () => {
            let question = circle.dataset.question;
            let value = circle.dataset.value;

            quiz
              .querySelectorAll(".circle")
              .forEach((c) =>
                c.classList.remove(
                  "selected-strongly-disagree",
                  "selected-disagree",
                  "selected-neutral",
                  "selected-agree",
                  "selected-strongly-agree"
                )
              );

            circle.classList.add(`selected-${value}`);

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
      quiz.querySelectorAll(".circle").forEach((circle, index) => {
        if (circle.classList.length > 1) {
          console.log(circle.classList);
          quiz.classList.remove("disabled");
          quiz.style.pointerEvents = "auto";
          quiz.style.opacity = "1";

          return;
        }
      });
    });
  }

  document.querySelectorAll(".circle").forEach((circle) => {
    circle.addEventListener("click", () => {
      let question = circle.dataset.question;
      let value = circle.dataset.value;

      document
        .querySelectorAll(`.circle[data-question="${question}"]`)
        .forEach((c) =>
          c.classList.remove(
            "selected-strongly-disagree",
            "selected-disagree",
            "selected-neutral",
            "selected-agree",
            "selected-strongly-agree"
          )
        );

      circle.classList.add(`selected-${value}`);

      saveResponse(question, value);
    });
  });

  loadPreviousSelection();
  enableNextQuestion();
  enableSelected();
});

const nextButtons = document.querySelectorAll(".next-btn");
nextButtons.forEach((button) => {
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

document.addEventListener("DOMContentLoaded", function () {
  const sectors = [
    "Basic Materials",
    "Consumer Discretionary",
    "Consumer Staples",
    "Energy",
    "Finance",
    "Healthcare",
    "Industrials",
    "Real Estate",
    "Technology",
    "Telecommunications",
    "Utilities",
  ];

  const container = document.querySelector(".wheel-container");
  if (!container) return; 

  const totalSectors = sectors.length;
  const angleStep = 360 / totalSectors;

  let sectorSelection =
    JSON.parse(localStorage.getItem("sectorSelection")) || {};

  sectors.forEach((sector) => {
    if (!(sector in sectorSelection)) {
      sectorSelection[sector] = 0;
    }
  });

  function updateLocalStorage() {
    localStorage.setItem("sectorSelection", JSON.stringify(sectorSelection));
  }

  sectors.forEach((sector, index) => {
    const startAngle = index * angleStep;
    const endAngle = startAngle + angleStep;

    const sectorDiv = document.createElement("div");
    sectorDiv.classList.add("sector");
    sectorDiv.style.transform = `rotate(${startAngle}deg)`;

    sectorDiv.style.clipPath = `polygon(
            50% 50%, 
            ${50 + 50 * Math.cos(((startAngle - 90) * Math.PI) / 180)}% ${
      50 + 50 * Math.sin(((startAngle - 90) * Math.PI) / 180)
    }%, 
            ${50 + 50 * Math.cos(((endAngle - 90) * Math.PI) / 180)}% ${
      50 + 50 * Math.sin(((endAngle - 90) * Math.PI) / 180)
    }%
        )`;

    const textSpan = document.createElement("span");
    textSpan.textContent = sector;
    textSpan.classList.add("sector-label");

    const textAngle = startAngle + angleStep / 2;
    const textX = 50 + 32 * Math.cos(((textAngle - 90) * Math.PI) / 180);
    const textY = 50 + 32 * Math.sin(((textAngle - 90) * Math.PI) / 180);
    textSpan.style.left = `${textX}%`;
    textSpan.style.top = `${textY}%`;
    textSpan.style.transform = `translate(-50%, -50%) rotate(${-startAngle}deg)`;

    sectorDiv.appendChild(textSpan);
    container.appendChild(sectorDiv);

    if (sectorSelection[sector] === 1) {
      sectorDiv.classList.add("selected");
    }

    sectorDiv.addEventListener("click", () => {
      if (sectorSelection[sector] === 1) {
        sectorSelection[sector] = 0; 
        sectorDiv.classList.remove("selected");
      } else {
        sectorSelection[sector] = 1; 
        sectorDiv.classList.add("selected");
      }
      updateLocalStorage();
    });

    
    sectorDiv.addEventListener("mouseover", () => {
      sectorDiv.classList.add("hover");
    });

    sectorDiv.addEventListener("mouseout", () => {
      sectorDiv.classList.remove("hover");
    });
  });

  function resetSelections() {
    sectors.forEach((sector) => {
      sectorSelection[sector] = 0;
    });
    updateLocalStorage();
    document
      .querySelectorAll(".sector")
      .forEach((sector) => sector.classList.remove("selected"));
  }

  document
    .getElementById("reset-btn")
    ?.addEventListener("click", resetSelections);
});

document.addEventListener("DOMContentLoaded", function () {
  const featureMapping = {
    avg_volume: ["q1", "q8", "q15"],
    volatility: ["q2", "q9", "q16"],
    pc_change: ["q3", "q10", "q17"],
    trend_consistency: ["q4", "q11", "q18"],
    avg_price: ["q5", "q12", "q19"],
    price_momentum: ["q6", "q13", "q20"],
    extra: ["q7", "q14", "q21"],
  };

  const valueMapping = {
    "strongly-disagree": 0,
    disagree: 0.25,
    neutral: 0.5,
    agree: 0.75,
    "strongly-agree": 1,
  };

  const responses = JSON.parse(localStorage.getItem("quizResponses")) || {};

  function computeAverages() {
    let featureScores = {};


    for (const [feature, questions] of Object.entries(featureMapping)) {
      let values = [];

      questions.forEach((q) => {
        if (responses[q]) {
          let numericValue = valueMapping[responses[q]];
          if (numericValue !== undefined) {
            values.push(numericValue);
          }
        }
      });

      featureScores[feature] =
        values.length > 0
          ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
          : null;
    }

    return featureScores;
  }

  const finalScores = computeAverages();

  localStorage.setItem("quizFinalScores", JSON.stringify(finalScores));

  if (document.getElementById("output-container")) {
    const outputContainer = document.getElementById("output-container");
    outputContainer.innerHTML = `<h2>Your Final Feature Scores</h2>`;

    Object.entries(finalScores).forEach(([feature, score]) => {
      outputContainer.innerHTML += `<p><strong>${feature}:</strong> ${score}</p>`;
    });
  }

  if (window.location.pathname.includes("sectors.html")) {
    const recommendationSelect = document.getElementById("recommendations");
    let recommendations = null; 

    if (recommendationSelect) {
      recommendationSelect.innerHTML = "";

      for (let i = 1; i <= 25; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        recommendationSelect.appendChild(option);
      }

      const savedRecommendations = localStorage.getItem("recommendations");
      if (savedRecommendations) {
        recommendationSelect.value = savedRecommendations;
        recommendations = savedRecommendations; 
      }

      recommendationSelect.addEventListener("change", function () {
        localStorage.setItem("recommendations", this.value);
        recommendations = this.value; 
        console.log("Updated recommendations:", recommendations);
        console.log("Recommendations in localstorage:", recommendations);
      });
    }
  }
});

const options = document.querySelectorAll(".time-option");

const timeOptions = document.querySelectorAll(".time-option");
const recommendationSelect = document.getElementById("recommendations");

const savedTime = localStorage.getItem("time");
if (savedTime) {
  timeOptions.forEach((option) => {
    if (option.getAttribute("data-time") === savedTime) {
      option.classList.add("selected");
    }
  });
}

timeOptions.forEach((option) => {
  option.addEventListener("click", function () {
    timeOptions.forEach((opt) => opt.classList.remove("selected"));

    this.classList.add("selected");

    localStorage.setItem("time", this.getAttribute("data-time"));

    console.log("Selected time:", this.getAttribute("data-time"));
    console.log("Time in localStorage:", localStorage.getItem("time"));
  });
});

const featureScores = JSON.parse(localStorage.getItem("quizFinalScores")) || {};

const sectorSelections =
  JSON.parse(localStorage.getItem("sectorSelection")) || {};
const selectedTime = localStorage.getItem("time") || "6";
const numRecommendations = localStorage.getItem("recommendations") || "10";
const finalOutput = {
  ...featureScores,
  ...sectorSelections,
  selectedTimePeriod: selectedTime,
  numberOfRecommendations: numRecommendations,
};


localStorage.setItem(
  "finalFeatureScoresWithSectors",
  JSON.stringify(finalOutput)
);

console.log("Final Feature Scores with Sectors BEFORE Submit:", finalOutput); 

window.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.querySelector("#submit-btn");

  if (submitBtn) {
    localStorage.setItem(
      "finalFeatureScoresWithSectors",
      JSON.stringify(finalOutput)
    );
    submitBtn.addEventListener("click", async () => {
    
      const featureScores =
        JSON.parse(localStorage.getItem("quizFinalScores")) || {};
      const sectorSelections =
        JSON.parse(localStorage.getItem("sectorSelection")) || {};
      const selectedTime = localStorage.getItem("time") || "6";
      const numRecommendations =
        localStorage.getItem("recommendations") || "10";

      const finalOutput = {
        ...featureScores,
        ...sectorSelections,
        selectedTimePeriod: selectedTime,
        numberOfRecommendations: numRecommendations,
      };

      console.log("Submit clicked, Final Feature Scores:", finalOutput);

      try {
        const response = await fetch(
          "http://stocky.ap-southeast-1.elasticbeanstalk.com/submit-data",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(finalOutput),
          }
        );

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        console.log("API Response:", result);
        localStorage.setItem("apiResultData", JSON.stringify(result));

        setTimeout(() => {
          window.location.href = "output.html";
        }, 3000);
      } catch (error) {
        console.error("Error submitting data:", error);
        alert("Failed to submit. Please try again.");
      }
    });
  }
});
document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ Script running in output.html");

  const storedDataRaw = localStorage.getItem("apiResultData");
  console.log("🔍 Checking localStorage in output.html:", storedDataRaw);
  const stockList = document.getElementById("stockList");
  const profitList = document.getElementById("profitList");
  const newsContainer = document.getElementById("newsContainer");
  const plHeader = document.getElementById("plHeader");
  const storedTimePeriod = localStorage.getItem("selectedTimePeriod") || "6";

  plHeader.textContent = `Returns for the past ${storedTimePeriod} months`;

  if (!storedDataRaw || storedDataRaw === "undefined") {
    console.warn(
      "⚠️ No valid apiResultData found in localStorage. Using empty object."
    );
    localStorage.removeItem("apiResultData"); 
  }

  const storedData =
    storedDataRaw && storedDataRaw !== "undefined"
      ? JSON.parse(storedDataRaw)
      : {};

  const performanceData = storedData.performance || {}; 

  console.log("📊 Retrieved Performance Data:", performanceData);

  if (storedData.stock && Object.keys(storedData.stock).length > 0) {
    console.log("✅ Stocks Retrieved:", storedData.stock);
    localStorage.setItem("stocksWithSectors", JSON.stringify(storedData.stock));
  } else {
    console.warn("⚠️ No stock recommendations received!");
    stockList.innerHTML = "<li>No recommendations available.</li>";
    profitList.innerHTML = "<li>-</li>";
  }

  if (performanceData && Object.keys(performanceData).length > 0) {
    stockList.innerHTML = "";
    profitList.innerHTML = "";

    Object.entries(storedData.stock).forEach(([sector, stockArray]) => {
      stockArray.forEach((stock) => {
        let stockItem = document.createElement("li");
        stockItem.textContent = `$${stock}`;
        stockList.appendChild(stockItem);

        let profitItem = document.createElement("li");
        let returnVal = performanceData[stock]; 

        if (returnVal !== undefined) {
          profitItem.textContent = `${returnVal.toFixed(2)}%`;
          profitItem.classList.add(
            returnVal > 0 ? "green" : returnVal < 0 ? "red" : "neutral"
          );
        } else {
          profitItem.textContent = "-";
          profitItem.classList.add("neutral");
        }

        profitList.appendChild(profitItem);
      });
    });
  } else {
    console.warn("⚠️ No performance data received!");
    profitList.innerHTML = "<li>-</li>";
  }

  if (storedData.articles && Object.keys(storedData.articles).length > 0) {
    console.log("📰 Articles Retrieved:", storedData.articles);

    Object.entries(storedData.articles).forEach(([sector, articles]) => {
      articles.forEach((article) => {
        let newsCard = document.createElement("div");
        newsCard.classList.add("news_card");

        let stockName = article.stock ? `$${article.stock}` : "Unknown Stock";
        let summary = article.text
          ? article.text.split(". ").slice(0, 2).join(". ") + "..."
          : "No summary available.";
        let articleImage =
          article.image_url && article.image_url.trim() !== ""
            ? article.image_url
            : "/images/News_image.png";

        newsCard.innerHTML = `
                    <div class="news_image">
                        <img src="${articleImage}" alt="News Image" class="article-thumbnail">
                    </div>
                    <div class="news_content">
                        <h3>${stockName} - ${
          article.article_title || "No Title Available"
        }</h3>
                        <p>${summary}</p>
                        <a href="${
                          article.article_link || "#"
                        }" target="_blank">Read more</a>
                    </div>
                `;

        newsContainer.appendChild(newsCard);
      });
    });
  } else {
    console.warn("⚠️ No news articles received!");
    newsContainer.innerHTML = "<p>No news available.</p>";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const storedData = JSON.parse(localStorage.getItem("apiResultData")) || {};
  const performanceData = storedData.performance || {};
  const stockData = storedData.stock || {};

  console.log("📊 Performance Data:", performanceData);
  console.log("🏢 Sector-wise Stocks:", stockData);

  if (Object.keys(stockData).length > 0) {
    renderHeatmap(stockData, performanceData);
  }
});

function renderHeatmap(stockData, performanceData) {
  const baseWidth = 900;
  const baseHeight = 500;
  const sectorCount = Object.keys(stockData).length;
  const totalStocks = Object.values(stockData).flat().length;
  const dynamicHeight = Math.max(
    baseHeight,
    sectorCount * 100,
    totalStocks * 50
  );
  const sectorNames = Object.keys(stockData); 
  const longestSectorName =
    sectorNames.length > 0
      ? Math.max(...sectorNames.map((name) => name.length))
      : 10; 

  const dynamicWidth = Math.max(900, 900 + longestSectorName * 8); 

  const container = d3.select("#sectorHeatmap");
  container.html("");

  const card = container
    .append("div")
    .attr("class", "heatmap-card")
    .style("width", `${dynamicWidth + 40}px`)
    .style("height", `${dynamicHeight + 100}px`);

  card
    .append("h2")
    .attr("class", "heatmap-title")
    .text("Stock Performance by Sector");

  const svg = card
    .append("svg")
    .attr("width", dynamicWidth)
    .attr("height", dynamicHeight);

  const treemap = d3
    .treemap()
    .size([dynamicWidth, dynamicHeight])
    .paddingInner(20)
    .paddingOuter(12)
    .round(true);

  const returns = Object.values(performanceData).filter((v) => v !== undefined);
  const minReturn = Math.min(...returns);
  const maxReturn = Math.max(...returns);

  const colorScale = d3
    .scaleLinear()
    .domain([minReturn, 0, maxReturn])
    .range(["#d73027", "#ffffff", "#1a9850"])
    .interpolate(d3.interpolateRgb);

  const sectorNodes = Object.entries(stockData)
    .map(([sector, stocks]) => {
      const filteredStocks = stocks.filter(
        (stock) => performanceData[stock] !== undefined
      );
      if (filteredStocks.length === 0) return null;
      return {
        name: sector,
        children: filteredStocks.map((stock) => ({
          name: stock,
          value: Math.abs(performanceData[stock]) || 1,
          performance: performanceData[stock] || 0,
        })),
      };
    })
    .filter(Boolean);

  const root = d3
    .hierarchy({ children: sectorNodes })
    .sum((d) => (d.children ? 0 : Math.max(d.value, 2)));

  treemap(root);

  const sectorAverages = {};
  Object.entries(stockData).forEach(([sector, stocks]) => {
    const validStocks = stocks.filter(
      (stock) => performanceData[stock] !== undefined
    );
    if (validStocks.length > 0) {
      const avgReturn =
        validStocks.reduce((sum, stock) => sum + performanceData[stock], 0) /
        validStocks.length;
      sectorAverages[sector] = avgReturn.toFixed(2);
    }
  });

  const sectorGroups = svg
    .selectAll(".sector-group")
    .data(root.children)
    .enter()
    .append("g")
    .attr("class", "sector-group")
    .attr("transform", (d) => `translate(${d.x0},${d.y0 + 20})`);

  sectorGroups
    .append("text")
    .attr("x", (d) => (d.x1 - d.x0) / 2)
    .attr("y", -10) 
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .attr("font-size", "16px")
    .text((d) => `${d.data.name} (${sectorAverages[d.data.name]}%)`); 

  sectorGroups
    .append("rect")
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0 - 10)
    .attr("fill", "none")
    .attr("stroke", "#333")
    .attr("stroke-width", 2)
    .attr("rx", 10);

  const nodes = sectorGroups
    .selectAll(".stock-node")
    .data((d) => d.children)
    .enter()
    .append("g")
    .attr("class", "stock-node")
    .attr(
      "transform",
      (d) => `translate(${d.x0 - d.parent.x0},${d.y0 - d.parent.y0})`
    );

  nodes
    .append("rect")
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0 - 5)
    .attr("fill", (d) => colorScale(d.data.performance) || "gray")
    .attr("stroke", "#fff")
    .attr("rx", 5);

  nodes
    .append("text")
    .attr("x", (d) => (d.x1 - d.x0) / 2)
    .attr("y", 15)
    .text((d) => d.data.name)
    .attr("class", "stock-label")
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("fill", "black");

  nodes
    .append("text")
    .attr("x", (d) => (d.x1 - d.x0) / 2)
    .attr("y", 30)
    .text((d) => `${d.data.performance.toFixed(2)}%`)
    .attr("class", "stock-return")
    .attr("font-size", "12px")
    .attr("text-anchor", "middle")
    .attr("fill", "black");
}
