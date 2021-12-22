app.initializers.add('nb-discussion-market', () => {
  app.extensionData
    .for('nb-discussion-market')
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
