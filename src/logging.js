function listenForWindowEvents(modelContainer, loggingConsole) {
  const sendModelDataQuery = createQueryMaker(modelContainer);
  const queries = new Set()

  return (e) => {
    if (e.data.type === 'nlw-notification') {
      console.log(e.data);

      if (e.data.event === 'button-widget-clicked') {
        // we want to check the model data when the user clicks *go* to disable it
        if (e.data.eventArgs.code === "go" && e.data.eventArgs.isNowRunning === false) {
          // get globals
          const queryTag1 = sendModelDataQuery("globals");
          queries.add(queryTag1);

          // and how we run a reporter
          const queryTag2 = sendModelDataQuery("reporter", { "code": "mean [xcor] of turtles" });
          queries.add(queryTag2);

          loggingConsole.innerText = loggingConsole.innerText + `\nUser clicked the go button to stop the model run.  Checking globals with a query (${queryTag1}) and running a reporter (${queryTag2})...`;
        }
      }
    }

    if (e.data.type === 'nlw-query-response') {
      // the query sourceInfo/tag checking is probably overkill, but I wanted to demonstrate how you can tie the results of certain queries back to logic in your app/logger/whatever.
      if (queries.has(e.data.sourceInfo)) {
        queries.delete(e.data.sourceInfo);

        switch (e.data.results[0].type) {
          case 'globals-result':
            loggingConsole.innerText = loggingConsole.innerText + `\n  Globals: ${JSON.stringify(e.data.results[0].globals)} (${e.data.sourceInfo})...`;
            break;

          case 'reporter-result':
            loggingConsole.innerText = loggingConsole.innerText + `\n  mean [xcor] of turtles: ${JSON.stringify(e.data.results[0].value)} (${e.data.sourceInfo})...`;
            break;

          default:
            break;
        }
      }
    }
  }
}
