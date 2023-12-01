defaultQueries = Object.freeze([
  { type: 'globals' }
, { type: 'reporter', code: 'patches'}
, { type: 'widgets' }
, { type: 'info' }
, { type: 'code' }
, { type: 'nlogo-file'}
, { type: 'metadata' }
, { type: 'view' }
]);

defaultQueriesByType = Object.freeze(defaultQueries.reduce( (queriesSoFar, query) => {
  queriesSoFar.set(query.type, query);
  return queriesSoFar;
}, new Map()));

clone = (oldObject) => {
  return JSON.parse(JSON.stringify(oldObject));
}

createQueryMaker = (modelContainer) => {
  queryCount = -1;
  const queryMaker = (type, args) => {
    queryCount = (queryCount + 1);
    sourceInfo = `query-number-${queryCount}`;
    query = clone(defaultQueriesByType.get(type));
    if (args !== null) { Object.assign(query, args) }
    modelContainer.contentWindow.postMessage({
      type:       'nlw-query'
    , queries:    [query]
    , sourceInfo: sourceInfo
    }, '*');

    return sourceInfo;
  }
  return queryMaker;
}

listenForQueryResponses = () => {
  window.addEventListener('message', (event) => {
    if (event.data.type === 'nlw-query-response') {
      console.log(event.data)
    }
  })
}
