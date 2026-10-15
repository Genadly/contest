'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Contests', [
      {
        title: 'Фотоконкурс «Лето 2026»',
        description: 'Присылайте свои лучшие летние снимки',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-08-31'),
        status: 'active',
        votesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Конкурс «Зимний пейзаж»',
        description: 'Голосование за лучшую зимнюю фотографию',
        startDate: new Date('2026-12-01'),
        endDate: new Date('2027-01-31'),
        status: 'draft',
        votesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Contests', null, {});
  }
};