"use strict"

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    await queryInterface.bulkInsert(
      "settings",
      [
        {
          key: "contacts",
          name: '{"en": "Contacts", "hy": "Կոնտակտ", "ru": "Контакт"}',
          description:
            '{"en": "Our contacts", "hy": "Մեր կոնտակտները", "ru": "Наши контакты"}',
          value: '["077-01-01-01","055-01-01-01","043-01-01-01"]',
          type: null,
          image: null,
          images: null,
          active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    )
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
}
