import * as React from 'react';
import {Tag} from '../../../web/js/tags/Tag';
import {TagsDB} from './TagsDB';
import Select from 'react-select';
import {Popover, PopoverBody} from 'reactstrap';
import {Blackout} from './Blackout';
import {TagSelectOptions} from './TagSelectOptions';
import {TagSelectOption} from './TagSelectOption';
import {FilteredTags} from './FilteredTags';

// noinspection TsLint
export class FilterTagInput extends React.Component<FilterTagInputProps, FilterTagInputState> {

    private readonly id = "filter-tag-input";

    constructor(props: FilterTagInputProps, context: any) {
        super(props, context);

        this.toggle = this.toggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            popoverOpen: false,
            defaultValue: []
        };

    }

    public render() {
        //
        const options: TagSelectOption[] =
            this.props.tagsDBProvider().tags().map( current => {
                return {
                    value: current.id,
                    label: current.label
                };
        });

        return (

            <div>

                <label id={this.id} onClick={this.toggle}>
                    Tags:
                    <i className="fa fa-tag doc-button doc-button-selectable"/>
                </label>

                <Popover placement="bottom"
                         isOpen={this.state.popoverOpen}
                         target={this.id}
                         toggle={this.toggle}
                         className="tag-input-popover">

                    <PopoverBody>

                        <Select
                            isMulti
                            isClearable
                            className="filter-tag-input"
                            classNamePrefix="select"
                            onChange={this.handleChange}
                            defaultValue={this.state.defaultValue}
                            options={options}
                        />

                    </PopoverBody>

                </Popover>

            </div>

        );

    }

    private toggle() {

        this.state = Object.assign(this.state, {
            popoverOpen: !this.state.popoverOpen
        });

        if (this.state.popoverOpen) {
            Blackout.enable();
        } else {
            Blackout.disable();

        }

        this.setState(this.state);

    }

    private handleChange(selectedOptions: any) {

        // as so as we handle the change we toggle off

        this.toggle();

        const defaultValue: TagSelectOptions[] = selectedOptions;

        this.state = Object.assign(this.state, {
            defaultValue
        });

        this.props.filteredTags.set(TagSelectOptions.toTags(selectedOptions));

        this.props.refresher();

        this.setState(this.state);

    }

}

interface FilterTagInputState {
    popoverOpen: boolean;
    defaultValue: TagSelectOption[];
}

export interface FilterTagInputProps {

    tagsDBProvider: () => TagsDB;

    onChange?: (values: Tag[]) => void;

    refresher: () => void;

    filteredTags: FilteredTags;

}
