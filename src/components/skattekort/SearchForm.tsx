import { EraserIcon, MagnifyingGlassIcon } from "@navikt/aksel-icons";
import { Button, HelpText, TextField, ToggleGroup } from "@navikt/ds-react";
import { useEffect, useRef, useState } from "react";
import styles from "./SearchForm.module.css";

interface SearchFormProps {
	currentYear?: number;
	previousFnr?: string;
	previousYear?: number;
	hasResults?: boolean;
}

const validateFnr = (value: string): string | null => {
	if (!value) {
		return "Fødselsnummer er påkrevd";
	}
	if (value.length !== 11) {
		return "Fødselsnummer må være 11 siffer";
	}
	if (!/^\d{11}$/.test(value)) {
		return "Fødselsnummer må inneholde kun tall";
	}
	return null;
};

export default function SearchForm({
	currentYear = new Date().getFullYear(),
	previousFnr = "",
	previousYear,
	hasResults = false,
}: SearchFormProps) {
	const [fnr, setFnr] = useState(previousFnr);
	const [inntektsaar, setInntektsaar] = useState(
		(previousYear ?? currentYear).toString(),
	);
	const [fnrError, setFnrError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const fnrRef = useRef(fnr);
	fnrRef.current = fnr;

	const getYears = () => {
		const now = new Date();
		const isAfterDec15 = now.getMonth() === 11 && now.getDate() >= 15;

		if (isAfterDec15) {
			return [currentYear, currentYear + 1];
		}
		return [currentYear - 1, currentYear];
	};

	const years = getYears();

	useEffect(() => {
		const form = containerRef.current?.closest("form");
		if (!form) return;

		const handler = (e: SubmitEvent) => {
			const error = validateFnr(fnrRef.current);
			if (error) {
				e.preventDefault();
				setFnrError(error);
				return;
			}
			setLoading(true);
		};

		form.addEventListener("submit", handler);
		return () => form.removeEventListener("submit", handler);
	}, []);

	const handleReset = () => {
		setFnr("");
		setFnrError(null);
		setInntektsaar(currentYear.toString());
		if (hasResults) {
			window.location.href = window.location.pathname;
		}
	};

	return (
		<div ref={containerRef} className={styles.box}>
			<div className={styles.helptext}>
				<HelpText title="Hjelp">
					Søk etter skattekort ved å oppgi fødselsnummer og velge år.
				</HelpText>
			</div>

			<div className={styles.fields}>
				<div className={styles.fieldsLeft}>
					<TextField
						label="Gjelder"
						name="fnr"
						size="small"
						value={fnr}
						onChange={(e) => {
							setFnr(e.target.value);
							setFnrError(null);
						}}
						error={fnrError}
						autoComplete="off"
						maxLength={11}
						className={styles.input}
					/>

					<ToggleGroup
						label="År"
						value={inntektsaar}
						onChange={(value) => setInntektsaar(value)}
						size="small"
					>
						{years.map((year) => (
							<ToggleGroup.Item key={year} value={year.toString()}>
								{year}
							</ToggleGroup.Item>
						))}
					</ToggleGroup>
					<input type="hidden" name="inntektsaar" value={inntektsaar} />
				</div>

				<div className={styles.fieldsRight}>
					<Button
						type="button"
						size="small"
						icon={<EraserIcon />}
						iconPosition="right"
						variant="secondary"
						onClick={handleReset}
					>
						Nullstill
					</Button>
					<Button
						type="submit"
						size="small"
						icon={<MagnifyingGlassIcon />}
						iconPosition="right"
						loading={loading}
					>
						Søk
					</Button>
				</div>
			</div>
		</div>
	);
}
