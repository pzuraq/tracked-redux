import {
  createStore as reduxCreateStore,
  Store,
  Reducer,
  Action,
  StoreEnhancer,
  PreloadedState,
} from 'redux';
import { createNode, updateNode } from './proxy';

export default function createStore<S, A extends Action, Ext, StateExt>(
  reducer: Reducer<S, A>,
  enhancer?: StoreEnhancer<Ext, StateExt>
): Store<S & StateExt, A> & Ext;

export default function createStore<S, A extends Action, Ext, StateExt>(
  reducer: Reducer<S, A>,
  preloadedState?: PreloadedState<S>,
  enhancer?: StoreEnhancer<Ext, StateExt>
): Store<S & StateExt, A> & Ext;

export default function createStore<S, A extends Action, Ext, StateExt>(
  reducer: Reducer<S, A>,
  preloadedState?: PreloadedState<S> | StoreEnhancer<Ext, StateExt>,
  enhancer?: StoreEnhancer<Ext, StateExt>
): Store<S & StateExt, A> & Ext {
  const store = reduxCreateStore(
    reducer,
    preloadedState as PreloadedState<S>,
    enhancer
  );

  const originalGetState = store.getState.bind(store);
  const ensureRootNode = (): void => {
    if (rootNode === undefined) {
      rootNode = createNode({
        state: originalGetState(),
      });
    }
  }

  let rootNode;

  store.getState = (): S => {
    ensureRootNode();
    return rootNode.proxy.state;
  };

  store.subscribe(() => {
    ensureRootNode();
    updateNode(rootNode, {
      state: originalGetState(),
    });
  });

  return store as Store<S & StateExt, A> & Ext;
}
