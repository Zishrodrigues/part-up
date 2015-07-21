Feature: Allow users to register

  As a nonloggedin user
  I want to register for a partup account
  So that I can use partup

  @dev
  Scenario: happy flow
    Given I navigate to "/register"
    When I enter my profile information
    Then I should see my username "Registered User"

  Scenario:
    Given I navigate to "/register"
    When I enter wrong profile information
    Then I should see some validation errors
