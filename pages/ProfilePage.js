const { expected } = require('../test-data/environment.json');

class ProfilePage {
  constructor(page) {
    this.page = page;
    this.editButton = page.getByRole('button', { name: 'Edit' });
    this.firstNameInput = page.getByLabel('First Name');
    this.saveChangesButton = page.getByRole('button', { name: 'Save Changes' });
    this.successMessage = page.getByText(expected.profileUpdatedMessage);
  }

  async open() {
    await this.page.getByText('Profile', { exact: true }).click();
  }

  async editFirstName(firstName) {
    await this.editButton.click();
    await this.firstNameInput.fill(firstName);
  }

  async saveChanges() {
    await this.saveChangesButton.click();
  }

  async updateFirstName(firstName) {
    await this.editFirstName(firstName);
    await this.saveChanges();
  }
}

module.exports = { ProfilePage };
