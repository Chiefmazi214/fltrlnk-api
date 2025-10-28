import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export enum LifestyleCategory {
    HOBBIES = 'hobbies',
    SPORTS = 'sports',
    MUSIC = 'music',
    MOVIES = 'movies',
    GAMES = 'games',
    LIFESTYLE = 'lifestyle',
    CAREER = 'career',
    OUTDOORS = 'outdoors',
    ENTERTAINMENT = 'entertainment',
    ART = 'art',
    STEM = 'stem',
    FOOD = 'food',
    OUTING = 'outing',
    LEISURE = 'leisure',
    NIGHT_LIFE = 'night_life'
}

@Schema({
    collection: 'lifestyle-info',
    timestamps: true
})
export class LifestyleInfo {
    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String, required: true })
    icon: string;

    @Prop({ type: String, required: true, enum: LifestyleCategory })
    category: LifestyleCategory;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;
}

export type LifestyleInfoDocument = HydratedDocument<LifestyleInfo>;
export const LifestyleInfoSchema = SchemaFactory.createForClass(LifestyleInfo); 