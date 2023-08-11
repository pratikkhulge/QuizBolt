// Function to extract query parameters from URL
function getQueryParams() {
  var queryParams = {};
  var urlParams = new URLSearchParams(window.location.search);
  for (var [key, value] of urlParams) {
    queryParams[key] = value;
  }
  return queryParams;
}

// Fetch the query parameters
var queryParams = getQueryParams();

var name = queryParams.name;
var age = queryParams.age;
var questionCount = queryParams.questionCount;
var category = queryParams.category;
var difficultyLevel = queryParams.difficultyLevel;
var questionType = queryParams.questionType;

const quizContainer = document.getElementById('quiz-container');
const resultContainer = document.getElementById('result-container');
const resultBox = document.getElementById('result-box');
let quizData;

var apiUrl = 'https://opentdb.com/api.php?' +
  'amount=' + questionCount;

if (category !== '0') {
  apiUrl += '&category=' + category;
}

if (difficultyLevel !== '0') {
  apiUrl += '&difficulty=' + difficultyLevel;
}

if (questionType !== '0') {
  apiUrl += '&type=' + questionType;
}

// console.log("Api Url: ", apiUrl);
// Fetch quiz questions from the API
fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    if (data.response_code === 1 && data.results.length === 0) {
      // Show an alert with an error message
      alert('Sorry, this combination is not available. Please try different parameters.');

      // Redirect to demo.html
      window.location.href = 'demo.html';
    } else {
      quizData = data.results;
      startQuiz();
    }
  });

function startQuiz() {
  let score = 0;
  let currentQuestion = 0;

  function displayQuiz() {
    const totalQuestions = quizData.length;

    if (currentQuestion >= totalQuestions) {
      showResult();
      return;
    }

    const question = quizData[currentQuestion];

    const questionElement = document.createElement('div');
    questionElement.classList.add('question');

    // Display the question number
    const questionNumber = document.createElement('h3');
    questionNumber.textContent = `Question ${currentQuestion + 1} of ${totalQuestions}`;
    questionElement.appendChild(questionNumber);

    // Display the question text
    const questionText = document.createElement('h2');
    questionText.innerHTML = question.question;
    questionElement.appendChild(questionText);

    // Shuffle the answer choices
    const choices = [...question.incorrect_answers, question.correct_answer];
    const shuffledChoices = shuffleArray(choices);

    // Display the answer choices
    shuffledChoices.forEach(choice => {
      const answerButton = document.createElement('button');
      answerButton.innerHTML = choice;
      answerButton.addEventListener('click', () => checkAnswer(choice, question.correct_answer));
      questionElement.appendChild(answerButton);
    });

    quizContainer.appendChild(questionElement);

    // Display navigation buttons at the bottom
    const navigationButtons = document.createElement('div');
    navigationButtons.classList.add('navigation-buttons');

    const previousButton = document.createElement('button');
    previousButton.textContent = 'Previous';
    previousButton.disabled = currentQuestion === 0;
    previousButton.classList.add('previous-button');
    previousButton.addEventListener('click', () => {
      currentQuestion--;
      clearQuizContainer();
      displayQuiz();
    });
    navigationButtons.appendChild(previousButton);

    if (currentQuestion < totalQuestions - 1) {
      const nextButton = document.createElement('button');
      nextButton.textContent = 'Next';
      nextButton.classList.add('next-button');
      nextButton.addEventListener('click', () => {
        currentQuestion++;
        clearQuizContainer();
        displayQuiz();
      });
      navigationButtons.appendChild(nextButton);
    } else {
      const endButton = document.createElement('button');
      endButton.textContent = 'End Test';
      endButton.addEventListener('click', showResult);
      navigationButtons.appendChild(endButton);
    }

    quizContainer.appendChild(navigationButtons);
  }

  function checkAnswer(selectedAnswer, correctAnswer) {
    const question = quizData[currentQuestion];
    question.selected_answer = selectedAnswer;

    if (selectedAnswer === correctAnswer) {
      score++;
    }

    currentQuestion++;
    clearQuizContainer();
    displayQuiz();
  }


  function clearQuizContainer() {
    while (quizContainer.firstChild) {
      quizContainer.firstChild.remove();
    }
  }

  function showResult() {
    clearQuizContainer();

    const totalQuestions = quizData.length;
    const resultPercentage = (score / totalQuestions) * 100;

    const resultElement = document.createElement('div');
    resultElement.classList.add('result-container');

    const resultBox = document.createElement('div');
    resultBox.classList.add('result-box');

    const scoreText = document.createElement('h2');
    scoreText.textContent = 'Quiz Result';
    resultBox.appendChild(scoreText);

    const scoreDisplay = document.createElement('h3');
    scoreDisplay.textContent = `You scored ${score} out of ${totalQuestions}`;
    resultBox.appendChild(scoreDisplay);

    const graphContainer = document.createElement('div');
    graphContainer.classList.add('graph-container');

    const graphBar = document.createElement('div');
    graphBar.classList.add('graph-bar');
    graphBar.style.width = `${resultPercentage}%`;
    graphContainer.appendChild(graphBar);

    resultBox.appendChild(graphContainer);

    const takeNewQuizButton = document.createElement('button');
    takeNewQuizButton.textContent = 'Take New Quiz';
    takeNewQuizButton.addEventListener('click', () => {
      window.location.href = 'demo.html';
    });
    resultBox.appendChild(takeNewQuizButton);

    const viewAnswersButton = document.createElement('button');
    viewAnswersButton.textContent = 'View Answers';
    viewAnswersButton.addEventListener('click', () => {
      localStorage.setItem('quizData', JSON.stringify(quizData));
      window.location.href = 'blackpage2.html?name=' + encodeURIComponent(name);
    });
    resultBox.appendChild(viewAnswersButton);

    resultElement.appendChild(resultBox);
    resultContainer.appendChild(resultElement);
  }



  function createScorecard() {
    const scorecard = document.createElement('div');
    scorecard.classList.add('scorecard');

    const scoreLabel = document.createElement('p');
    scoreLabel.textContent = 'Score:';
    scorecard.appendChild(scoreLabel);

    const scoreValue = document.createElement('p');
    const scorePercentage = (score / quizData.length) * 100;
    scoreValue.textContent = `${scorePercentage.toFixed(2)}% (${score}/${quizData.length})`;
    scorecard.appendChild(scoreValue);

    return scorecard;
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Call displayQuiz() to start the quiz
  displayQuiz();
}
