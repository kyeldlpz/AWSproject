// Replace with your actual API Gateway endpoint
const API_BASE_URL = "https://your-api-id.execute-api.region.amazonaws.com/prod"

// DOM elements
const voteBtn = document.getElementById("voteBtn")
const totalVotesElement = document.getElementById("totalVotes")
const countAElement = document.getElementById("countA")
const countBElement = document.getElementById("countB")
const barAElement = document.getElementById("barA")
const barBElement = document.getElementById("barB")
const percentAElement = document.getElementById("percentA")
const percentBElement = document.getElementById("percentB")

// Vote submission handler
voteBtn.addEventListener("click", async () => {
  const choice = document.querySelector('input[name="vote"]:checked')

  if (!choice) {
    showNotification("⚠️ Please select an option before voting.", "warning")
    return
  }

  // Show loading state
  voteBtn.classList.add("loading")
  voteBtn.disabled = true

  try {
    // Submit vote
    const response = await fetch(`${API_BASE_URL}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ option: choice.value }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    showNotification("✅ Vote submitted successfully!", "success")

    // Clear selection
    choice.checked = false

    // Load updated results
    await loadResults()
  } catch (err) {
    console.error("Error submitting vote:", err)
    showNotification("❌ Error submitting vote. Please try again.", "error")
  } finally {
    // Remove loading state
    voteBtn.classList.remove("loading")
    voteBtn.disabled = false
  }
})

// Fetch results and update UI
async function loadResults() {
  try {
    const response = await fetch(`${API_BASE_URL}/results`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    const countA = data.OptionA || 0
    const countB = data.OptionB || 0
    const total = countA + countB

    // Update counts with animation
    updateCountWithAnimation(countAElement, countA)
    updateCountWithAnimation(countBElement, countB)
    updateCountWithAnimation(totalVotesElement, total)

    // Calculate percentages
    const percentA = total > 0 ? Math.round((countA / total) * 100) : 0
    const percentB = total > 0 ? Math.round((countB / total) * 100) : 0

    // Update progress bars with smooth animation
    setTimeout(() => {
      barAElement.style.width = `${percentA}%`
      barBElement.style.width = `${percentB}%`

      percentAElement.textContent = `${percentA}%`
      percentBElement.textContent = `${percentB}%`
    }, 100)
  } catch (err) {
    console.error("Error loading results:", err)
    showNotification("⚠️ Unable to load results. Retrying...", "warning")

    // Retry after 3 seconds
    setTimeout(loadResults, 3000)
  }
}

// Update count with animation
function updateCountWithAnimation(element, newValue) {
  element.classList.add("count-update")
  element.textContent = newValue

  setTimeout(() => {
    element.classList.remove("count-update")
  }, 500)
}

// Show notification
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification")
  existingNotifications.forEach((notification) => notification.remove())

  // Create notification element
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.textContent = message

  // Add styles
  Object.assign(notification.style, {
    position: "fixed",
    top: "80px",
    right: "20px",
    padding: "12px 20px",
    borderRadius: "8px",
    color: "white",
    fontWeight: "500",
    fontSize: "14px",
    zIndex: "1000",
    transform: "translateX(100%)",
    transition: "transform 0.3s ease",
    maxWidth: "300px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  })

  // Set background color based on type
  const colors = {
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  }
  notification.style.background = colors[type] || colors.info

  // Add to DOM
  document.body.appendChild(notification)

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  // Auto remove after 4 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove()
      }
    }, 300)
  }, 4000)
}

// Auto-refresh results every 5 seconds
function startAutoRefresh() {
  setInterval(loadResults, 5000)
}

// Initialize app
function initializeApp() {
  // Load initial results
  loadResults()

  // Start auto-refresh
  startAutoRefresh()

  // Add smooth scrolling for any anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })
}

// Load app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp)
} else {
  initializeApp()
}

// Handle visibility change to pause/resume auto-refresh
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // Page is hidden, you might want to pause auto-refresh
    console.log("Page hidden - auto-refresh continues")
  } else {
    // Page is visible, ensure we have latest data
    loadResults()
  }
})

// Add keyboard navigation for voting options
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    e.preventDefault()
    const options = document.querySelectorAll('input[name="vote"]')
    const currentChecked = document.querySelector('input[name="vote"]:checked')

    let nextIndex = 0
    if (currentChecked) {
      const currentIndex = Array.from(options).indexOf(currentChecked)
      nextIndex =
        e.key === "ArrowUp" ? (currentIndex - 1 + options.length) % options.length : (currentIndex + 1) % options.length
    }

    options[nextIndex].checked = true
  } else if (e.key === "Enter" || e.key === " ") {
    const focusedElement = document.activeElement
    if (focusedElement === voteBtn) {
      e.preventDefault()
      voteBtn.click()
    }
  }
})
