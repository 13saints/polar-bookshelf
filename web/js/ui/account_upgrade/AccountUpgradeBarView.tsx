import * as React from 'react';
import {Logger} from "../../logger/Logger";
import {Button} from "reactstrap";
import {AccountUpgrades, AccountUsage} from "../../accounts/AccountUpgrades";
import {AccountPlan} from "../../accounts/Account";
import {RendererAnalytics} from "../../ga/RendererAnalytics";
import {Arrays} from "../../util/Arrays";

const log = Logger.create();

const MESSAGE = createRandomizedUpgradeMessage();

interface UpgradeRequiredProps {
    readonly planRequired?: AccountPlan;
}

const UpgradeRequired = (props: UpgradeRequiredProps) => {

    RendererAnalytics.event({category: 'upgrade', action: 'triggered-upgrade-required'});

    const onClick = () => {
        RendererAnalytics.event({category: 'upgrade', action: 'clicked-button-to-plans'});
        document.location.hash = 'plans';
    };

    return <div className="mt-1 mb-1 p-1 rounded"
                style={{
                    backgroundColor: '#ffcccc',
                    fontWeight: 'bold'
                }}>

        <Button color="danger"
                size="sm"
                style={{fontWeight: 'bold'}}
                onClick={() => onClick()}>

            <i className="fas fa-certificate"/>
            &nbsp;
            Upgrade Required

        </Button>

        <span className="ml-1">
            Your account has exceeded limits for your current plan.  Please upgrade.
        </span>

    </div>;

};


const GoPremium = (props: UpgradeRequiredProps) => {

    RendererAnalytics.event({category: 'upgrade', action: 'triggered-upgrade-required'});

    const onClick = () => {
        RendererAnalytics.event({category: 'upgrade', action: 'clicked-button-to-plans'});
        document.location.hash = 'plans';
    };

    return <div className="mt-1 mb-1 p-1 rounded"
                style={{
                    backgroundColor: '#ffcccc',
                    fontWeight: 'bold'
                }}>

        <Button color="primary"
                size="sm"
                style={{fontWeight: 'bold'}}
                onClick={() => onClick()}>

            <i className="fas fa-certificate"/>
            &nbsp;
            Go Premium!

        </Button>

        <span className="ml-1">
            {MESSAGE}
        </span>

    </div>;

};


const NullComponent = () => {
    return <div/>;
};

/**
 * Listen to the machine datastore for this user and if their account isn't in
 * line with the machine data store then we have to force them to upgrade.
 */
export class AccountUpgradeBarView extends React.Component<IProps, IState> {

    constructor(props: IProps, context: any) {
        super(props, context);
    }

    public render() {

        const {plan, accountUsage} = this.props;

        if (plan && accountUsage) {

            const planRequiredForUpgrade = AccountUpgrades.upgradeRequired(plan, accountUsage);

            if (planRequiredForUpgrade) {
                return <UpgradeRequired planRequired={planRequiredForUpgrade}/>;
            }

        }

        if (! plan || plan === 'free') {
            return <GoPremium/>;
        } else {
            return <NullComponent/>;
        }

    }

}

interface IProps {
    readonly plan?: AccountPlan;
    readonly accountUsage?: AccountUsage;
}

interface IState {
}

function  createRandomizedUpgradeMessage() {

    const messages = [
        "Want a dark mode? How about ePub support? Go premium and support Polar development!",
        "Premium users help support future Polar development and are generally pretty awesome.",
        "Guess who else used Polar Premium? Einstein! You want to be like Einstein don't you?",
        "It's scientifically proven that Polar premium adds 100 years to your life!",
    ];

    const randomized = Arrays.shuffle(...messages);

    return Arrays.first(randomized);

}
