import * as React from 'react';
import {Button} from 'reactstrap';
import {ActiveSelection} from '../popup/ActiveSelections';
import {IEventDispatcher} from '../../reactor/SimpleReactor';
import {AnnotationDescriptor} from '../../metadata/AnnotationDescriptor';
import {HighlightCreatedEvent} from '../../comments/react/HighlightCreatedEvent';
import {HighlightColor} from '../../metadata/BaseHighlight';
import {PopupStateEvent} from '../popup/PopupStateEvent';
import {EventListener} from '../../reactor/EventListener';
import {Numbers} from '../../util/Numbers';
import {SplashLifecycle} from '../../../../apps/repository/js/splash/SplashLifecycle';
import {LifecycleEvents} from '../util/LifecycleEvents';
import {LocalPrefs} from '../util/LocalPrefs';
import {RendererAnalytics} from '../../ga/RendererAnalytics';

export class PrioritizedComponentManager extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

    }

    public render() {

        const NullComponent = () => {
            return (<div></div>);
        };

        if (! LocalPrefs.isMarked(LifecycleEvents.TOUR_TERMINATED)) {
            // no splashes unless we have the tour.
            return <NullComponent/>;
        }

        if (! SplashLifecycle.canShow()) {
            return <NullComponent/>;
        }

        const sorted =
            [...this.props.prioritizedComponentRefs]
                .filter(current => current.priority() !== undefined)
                .sort((o1, o2) => Numbers.compare(o1.priority(), o2.priority()) * -1);

        if (sorted.length === 0 || document.location!.hash !== '') {
            // return an empty div if we have no splashes OR if we have a
            // specific hash URL to load.  The splashes should only go on the
            // home page on load.

            return <NullComponent/>;
        }

        // mark this as shown so that we delay the next splash, even on refresh
        SplashLifecycle.markShown();

        RendererAnalytics.event({category: 'splashes', action: 'shown'});

        const prioritizedComponentRef = sorted[0];

        RendererAnalytics.event({category: 'splashes-shown', action: prioritizedComponentRef.id});

        // return the top ranking element.
        return prioritizedComponentRef.create();

    }

}

/**
 * Allows us to give a set or components to the
 */
export interface PrioritizedComponent {

    /**
     * Allows the component to determine its priority.  This could be used
     * to see if it needs to popup now or just some sort of static priority.
     *
     * Return undefined if the component should not be displayed.  This can be
     * used if the user has already performed a given action.
     */
    priority(): number | undefined;

}

export interface PrioritizedComponentRef {

    id: string;

    /**
     * Allows the component to determine its priority.  This could be used
     * to see if it needs to popup now or just some sort of static priority.
     *
     * Return undefined if the component should not be displayed.  This can be
     * used if the user has already performed a given action.
     */
    priority(): number | undefined;

    /**
     * Create the component when we're ready for it.
     */
    create(): JSX.Element;

}

export interface IProps {

    prioritizedComponentRefs: ReadonlyArray<PrioritizedComponentRef>;

}


export interface IState {

}

