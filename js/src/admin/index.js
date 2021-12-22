app.initializers.add('nbflarum-discussion-market', () => {
  console.log("init discussmarket")
  app.extensionData
    .for('nbflarum-discussion-market')
    .registerSetting(
        {
          setting: 'discussmarket.tags',
          label: 'Enabled Tags (separate by , )',
          type: 'text'
        }
      )
      .registerSetting(
        {
          setting: 'discussmarket.abcd',
          label: 'Enabled Tags (separate by , )',
          type: 'bool'
        }
    );
});
