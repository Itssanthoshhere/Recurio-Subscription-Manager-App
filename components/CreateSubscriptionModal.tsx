import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import clsx from "clsx";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

interface CreateSubscriptionFormData {
  name: string;
  price: number;
  billing: string;
  category: string;
  color: string;
  icon: string;
  startDate: string; // ISO string
  renewalDate: string; // ISO string
}

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateSubscriptionFormData) => Promise<void>;
}

type Frequency = "Monthly" | "Yearly";
type Category =
  | "Entertainment"
  | "AI Tools"
  | "Developer Tools"
  | "Design"
  | "Productivity"
  | "Other";

const CATEGORIES: Category[] = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Other",
];

const CATEGORY_COLORS: Record<Category, string> = {
  Entertainment: "#ff6b6b",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#95e1d3",
  Other: "#d4d4d4",
};

const DATE_FORMAT = "DD/MM/YYYY";

const toDisplayDate = (iso: string) => dayjs(iso).format(DATE_FORMAT);

const parseDate = (input: string): dayjs.Dayjs | null => {
  const parsed = dayjs(input, DATE_FORMAT, true);
  return parsed.isValid() ? parsed : null;
};

const formatPlaceholder = () => dayjs().format(DATE_FORMAT);

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onSubmit,
}: CreateSubscriptionModalProps) => {
  const now = dayjs();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [category, setCategory] = useState<Category>("Other");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDateInput, setStartDateInput] = useState(toDisplayDate(now.toISOString()));
  const [renewalDateInput, setRenewalDateInput] = useState(toDisplayDate(now.add(1, "month").toISOString()));

  // Auto-update renewal date when frequency or start date changes
  const handleStartDateChange = (text: string) => {
    setStartDateInput(text);
    const parsed = parseDate(text);
    if (parsed) {
      const newRenewal = frequency === "Yearly"
        ? parsed.add(1, "year")
        : parsed.add(1, "month");
      setRenewalDateInput(toDisplayDate(newRenewal.toISOString()));
    }
  };

  const handleFrequencyChange = (freq: Frequency) => {
    setFrequency(freq);
    const parsed = parseDate(startDateInput);
    if (parsed) {
      const newRenewal = freq === "Yearly"
        ? parsed.add(1, "year")
        : parsed.add(1, "month");
      setRenewalDateInput(toDisplayDate(newRenewal.toISOString()));
    }
  };

  const isValidPrice = () => {
    const trimmed = price.trim();
    if (!trimmed) return false;
    if (!/^\s*[+-]?(\d+(\.\d+)?|\.\d+)\s*$/.test(trimmed)) return false;
    const num = Number(trimmed);
    return Number.isFinite(num) && num > 0;
  };

  const isValidStartDate = () => parseDate(startDateInput) !== null;
  const isValidRenewalDate = () => parseDate(renewalDateInput) !== null;

  const isValidForm =
    name.trim() !== "" &&
    isValidPrice() &&
    isValidStartDate() &&
    isValidRenewalDate() &&
    !isSubmitting;

  const determineIcon = (subName: string, cat: string): string => {
    const n = subName.toLowerCase();
    if (n.includes("notion")) return "notion";
    if (n.includes("dropbox")) return "dropbox";
    if (n.includes("chatgpt") || n.includes("openai")) return "openai";
    if (n.includes("adobe") || n.includes("creative cloud")) return "adobe";
    if (n.includes("medium")) return "medium";
    if (n.includes("figma")) return "figma";
    if (n.includes("github") || n.includes("copilot")) return "github";
    if (n.includes("claude") || n.includes("anthropic")) return "claude";
    if (n.includes("canva")) return "canva";
    
    if (n.includes("music") || n.includes("spotify") || n.includes("apple") || cat === "Entertainment") {
      return "music";
    }
    
    return "plus";
  };

  const handleSubmit = async () => {
    if (!isValidForm) return;
    setIsSubmitting(true);
    try {
      const startIso = parseDate(startDateInput)!.toISOString();
      const renewalIso = parseDate(renewalDateInput)!.toISOString();

      await onSubmit({
        name: name.trim(),
        price: Number(price.trim()),
        billing: frequency,
        category,
        color: CATEGORY_COLORS[category],
        icon: determineIcon(name, category),
        startDate: startIso,
        renewalDate: renewalIso,
      });

      resetForm();
      onClose();
    } catch (err) {
      console.error("Subscription creation failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    const n = dayjs();
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Other");
    setStartDateInput(toDisplayDate(n.toISOString()));
    setRenewalDateInput(toDisplayDate(n.add(1, "month").toISOString()));
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <Pressable className="modal-overlay" onPress={handleClose}>
          <Pressable
            className="modal-container"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable className="modal-close" onPress={handleClose}>
                <Text className="modal-close-text">✕</Text>
              </Pressable>
            </View>

            <ScrollView
              className="p-5"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ gap: 20, paddingBottom: 20 }}
            >
              {/* Name */}
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  className="auth-input"
                  placeholder="Subscription name"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={name}
                  onChangeText={setName}
                  editable={!isSubmitting}
                />
              </View>

              {/* Price */}
              <View className="auth-field">
                <Text className="auth-label">Price</Text>
                <TextInput
                  className="auth-input"
                  placeholder="0.00"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  editable={!isSubmitting}
                />
              </View>

              {/* Frequency */}
              <View className="auth-field">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  <Pressable
                    className={clsx(
                      "picker-option",
                      frequency === "Monthly" && "picker-option-active",
                    )}
                    onPress={() => handleFrequencyChange("Monthly")}
                    disabled={isSubmitting}
                  >
                    <Text
                      className={clsx(
                        "picker-option-text",
                        frequency === "Monthly" && "picker-option-text-active",
                      )}
                    >
                      Monthly
                    </Text>
                  </Pressable>
                  <Pressable
                    className={clsx(
                      "picker-option",
                      frequency === "Yearly" && "picker-option-active",
                    )}
                    onPress={() => handleFrequencyChange("Yearly")}
                    disabled={isSubmitting}
                  >
                    <Text
                      className={clsx(
                        "picker-option-text",
                        frequency === "Yearly" && "picker-option-text-active",
                      )}
                    >
                      Yearly
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Category */}
              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      className={clsx(
                        "category-chip",
                        category === cat && "category-chip-active",
                      )}
                      onPress={() => setCategory(cat)}
                      disabled={isSubmitting}
                    >
                      <Text
                        className={clsx(
                          "category-chip-text",
                          category === cat && "category-chip-text-active",
                        )}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Start Date */}
              <View className="auth-field">
                <Text className="auth-label">Start Date</Text>
                <TextInput
                  className={clsx(
                    "auth-input",
                    startDateInput && !isValidStartDate() && "border-red-400",
                  )}
                  placeholder={formatPlaceholder()}
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={startDateInput}
                  onChangeText={handleStartDateChange}
                  keyboardType="numbers-and-punctuation"
                  editable={!isSubmitting}
                />
                {startDateInput !== "" && !isValidStartDate() && (
                  <Text style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>
                    Enter a valid date (DD/MM/YYYY)
                  </Text>
                )}
              </View>

              {/* Renewal Date */}
              <View className="auth-field">
                <Text className="auth-label">Renewal Date</Text>
                <TextInput
                  className={clsx(
                    "auth-input",
                    renewalDateInput && !isValidRenewalDate() && "border-red-400",
                  )}
                  placeholder={formatPlaceholder()}
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={renewalDateInput}
                  onChangeText={setRenewalDateInput}
                  keyboardType="numbers-and-punctuation"
                  editable={!isSubmitting}
                />
                {renewalDateInput !== "" && !isValidRenewalDate() && (
                  <Text style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>
                    Enter a valid date (DD/MM/YYYY)
                  </Text>
                )}
              </View>

              {/* Submit */}
              <Pressable
                className={clsx(
                  "auth-button",
                  !isValidForm && "auth-button-disabled",
                )}
                onPress={handleSubmit}
                disabled={!isValidForm}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="auth-button-text">Create Subscription</Text>
                )}
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;
