const getTotalHoursByMonth = (placeWork) => {
  const monthlyHours = {};
  placeWork.forEach(record => {
    const key = `${record.year}-${record.month}`;
    if (!monthlyHours[key]) {
      monthlyHours[key] = 0;
    }
    record.projects.forEach(project => {
      monthlyHours[key] += project.time;
    });
  });

  return monthlyHours;
};

module.exports.calculateMyHours = function (next) {
  const user = this;

  const monthlyHours = getTotalHoursByMonth(user.placeWork);
  user.myHours = []; 
  for (const [key, hours] of Object.entries(monthlyHours)) {
    const [year, month] = key.split('-');
    user.myHours.push({
      year: parseInt(year),
      month: parseInt(month),
      hours: hours
    });
  }

  next(); 
};

module.exports.calculateMyHoursOnUpdate = async function (next) {
  try {
    const user = await this.model.findOne(this.getQuery());
    if (user) {
      const monthlyHours = getTotalHoursByMonth(user.placeWork);

      const updatedMyHours = [];
      for (const [key, hours] of Object.entries(monthlyHours)) {
        const [year, month] = key.split('-');
        updatedMyHours.push({
          year: parseInt(year),
          month: parseInt(month),
          hours: hours
        });
      }

      this.set({ myHours: updatedMyHours });
    }

    next();
  } catch (error) {
    next(error);
  }
};
module.exports.getTotalHoursByMonth = getTotalHoursByMonth;